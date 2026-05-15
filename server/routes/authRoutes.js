const jwt = require("jsonwebtoken");
const express = require("express");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const authMiddleware = require("../middleware/authMiddleware");
const { OAuth2Client } = require("google-auth-library");
const { sendWelcomeEmail, sendOTPEmail, sendRegistrationOTPEmail } = require("../utils/emailService");

const router = express.Router();
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// ─── In-memory store for pending registration OTPs ──────────────────────────
// { email -> { otp, expiry } }  (no DB model needed, 10-min TTL)
const pendingOTPs = new Map();

// Auto-clean expired entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [email, data] of pendingOTPs.entries()) {
    if (data.expiry < now) pendingOTPs.delete(email);
  }
}, 5 * 60 * 1000);


// STEP 1: Send registration OTP to verify Gmail exists
router.post("/send-registration-otp", async (req, res) => {
  const { email } = req.body;

  // Enforce @gmail.com only
  if (!email || !email.toLowerCase().endsWith("@gmail.com")) {
    return res.status(400).json({
      message: "Only Gmail addresses (@gmail.com) are accepted for registration.",
    });
  }

  try {
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ message: "An account with this email already exists." });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiry = Date.now() + 10 * 60 * 1000; // 10 minutes

    // Store in memory
    pendingOTPs.set(email.toLowerCase(), { otp, expiry });

    // Try to send — if Gmail rejects the address, this will throw
    await sendRegistrationOTPEmail(email, otp);

    res.status(200).json({ message: "Verification code sent to your Gmail." });
  } catch (error) {
    console.error("Registration OTP error:", error.message);
    // Clean up so user can retry
    pendingOTPs.delete(email.toLowerCase());
    res.status(500).json({
      message: "Could not deliver the verification email. Please check the Gmail address and try again.",
    });
  }
});

// STEP 2: Create account (requires valid OTP)
router.post("/register", async (req, res) => {
  const { fullName, email, password, otp } = req.body;
  const normalizedEmail = (email || "").toLowerCase();

  // Enforce @gmail.com
  if (!normalizedEmail.endsWith("@gmail.com")) {
    return res.status(400).json({
      message: "Only Gmail addresses (@gmail.com) are accepted.",
    });
  }

  // Require OTP
  if (!otp) {
    return res.status(400).json({ message: "Verification code is required." });
  }

  try {
    // Validate OTP
    const pending = pendingOTPs.get(normalizedEmail);
    if (!pending) {
      return res.status(400).json({
        message: "No verification code found for this email. Please request a new one.",
      });
    }
    if (Date.now() > pending.expiry) {
      pendingOTPs.delete(normalizedEmail);
      return res.status(400).json({ message: "Verification code has expired. Please request a new one." });
    }
    if (pending.otp !== otp.trim()) {
      return res.status(400).json({ message: "Incorrect verification code. Please try again." });
    }

    // OTP is valid — remove it
    pendingOTPs.delete(normalizedEmail);

    // Check if user already exists
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      fullName,
      email: normalizedEmail,
      password: hashedPassword,
    });

    await newUser.save();

    // Send Welcome Email (fire-and-forget)
    sendWelcomeEmail(normalizedEmail, fullName);

    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    console.error("Register error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
});



// LOGIN USER part

router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Prevent password login for Google-only accounts
    if (user.authProvider === "google" && !user.password) {
      return res.status(400).json({ message: "This account uses Google Sign-In. Please continue with Google." });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Incorrect Password!" });
    }

    // Track login activity
    user.lastLogin = new Date();
    user.loginCount = (user.loginCount || 0) + 1;
    user.isActive = true;
    await user.save();

    const token = jwt.sign(
    { userId: user._id, roleType: user.roleType || "user" },
    process.env.JWT_SECRET,
    { expiresIn: "1d" }   
  );

    const { password: pwd, ...userData } = user._doc;

    res.status(200).json({
      message: "Login successful",
      token,
      user: userData,
    });

  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});


// GOOGLE OAUTH LOGIN / SIGNUP

router.post("/google", async (req, res) => {
  const { credential } = req.body;

  if (!credential) {
    return res.status(400).json({ message: "No Google credential provided" });
  }

  try {
    // Verify the Google token
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { sub: googleId, email, name, picture } = payload;

    // Check if user already exists by email
    let user = await User.findOne({ email });

    if (user) {
      // User exists — update googleId if they signed up with email before
      if (!user.googleId) {
        user.googleId = googleId;
        user.authProvider = "google";
        user.profileImage = picture || user.profileImage;
        await user.save();
      }
    } else {
      // New user — create account (role will be null → portal selection)
      user = new User({
        fullName: name,
        email,
        googleId,
        authProvider: "google",
        profileImage: picture || "",
        role: null,
      });
      await user.save();
      
      // Send Welcome Email for new Google user
      sendWelcomeEmail(email, name);
    }

    // Track login activity
    user.lastLogin = new Date();
    user.loginCount = (user.loginCount || 0) + 1;
    user.isActive = true;
    await user.save();

    // Generate JWT exactly like normal login
    const token = jwt.sign(
      { userId: user._id, roleType: user.roleType || "user" },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    const { password: pwd, ...userData } = user._doc;

    res.status(200).json({
      message: "Google login successful",
      token,
      user: userData,
    });

  } catch (error) {
    console.error("Google auth error:", error.message);
    res.status(401).json({ message: "Google authentication failed. Please try again." });
  }
});


// FORGOT PASSWORD - SEND OTP
router.post("/forgot-password", async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found with this email" });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    user.resetPasswordOTP = otp;
    user.resetPasswordExpires = expiry;
    await user.save();

    // Send OTP via Email
    await sendOTPEmail(email, otp);

    res.status(200).json({ message: "OTP sent to your email" });
  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// VERIFY OTP
router.post("/verify-otp", async (req, res) => {
  const { email, otp } = req.body;

  try {
    const user = await User.findOne({ 
      email,
      resetPasswordOTP: otp,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    res.status(200).json({ message: "OTP verified correctly" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// RESET PASSWORD
router.post("/reset-password", async (req, res) => {
  const { email, otp, newPassword } = req.body;

  try {
    const user = await User.findOne({ 
      email,
      resetPasswordOTP: otp,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired recovery session" });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    
    // Clear OTP fields
    user.resetPasswordOTP = null;
    user.resetPasswordExpires = null;
    user.authProvider = "local"; // In case they are switching from Google back to local
    
    await user.save();

    res.status(200).json({ message: "Password reset successful! You can now login." });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});


// GET CURRENT USER DATA
router.get("/me", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
