const express = require("express");
const router = express.Router();
const User = require("../models/User");
const { sendOTPEmail, sendWelcomeEmail } = require("../utils/emailService");
const { generateAndSendWeeklyDigest } = require("../utils/cronService");
const authMiddleware = require("../middleware/authMiddleware");
const multer = require("multer");
const path = require("path");

// Configure Multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/avatars");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ 
  storage,
  limits: { fileSize: 8 * 1024 * 1024 } // 8MB limit
});

// Select portal (Student or Professional)

//SET ROLE
router.put("/set-role", authMiddleware, async (req, res) => {
  try {
    const { role } = req.body;

    const currentUser = await User.findById(req.user.userId);
    if (currentUser.role && (currentUser.role === "student" || currentUser.role === "professional")) {
      return res.status(400).json({ message: "Role is already set and cannot be changed" });
    }

    const user = await User.findByIdAndUpdate(
      req.user.userId,
      { role },
      { new: true }
    );

    res.json({
      message: "Role saved successfully",
      user,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// UPDATE PROFILE (NEW ROUTE)
router.put("/update-profile", authMiddleware, async (req, res) => {
  try {
    const { gender, contact, location, nickname } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      req.user.userId,
      { gender, contact, location, nickname },
      { new: true }
    );

    res.json(updatedUser);

  } catch (error) {
    res.status(500).json({ message: "Error updating profile" });
  }
});

// UPDATE PROFILE PICTURE
router.put("/update-avatar", authMiddleware, upload.single("avatar"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const avatarPath = `/uploads/avatars/${req.file.filename}`;

    const updatedUser = await User.findByIdAndUpdate(
      req.user.userId,
      { profilePicture: avatarPath },
      { new: true }
    );

    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ message: "Error uploading avatar" });
  }
});

// UPDATE POMODORO SETTINGS
router.put("/pomodoro-settings", authMiddleware, async (req, res) => {
  try {
    const { soundEnabled, desktopEnabled, soundType } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      req.user.userId,
      { 
        $set: { 
          "pomodoroSettings.soundEnabled": soundEnabled,
          "pomodoroSettings.desktopEnabled": desktopEnabled,
          "pomodoroSettings.soundType": soundType || "droplet"
        } 
      },
      { new: true }
    );

    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ message: "Error updating pomodoro settings" });
  }
});

// UPDATE DAILY MANTRA
router.put("/update-mantra", authMiddleware, async (req, res) => {
  try {
    const { mantra } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      req.user.userId,
      { 
        "dailyMantra.text": mantra,
        "dailyMantra.date": new Date() 
      },
      { new: true }
    );

    res.json(updatedUser);

  } catch (error) {
    res.status(500).json({ message: "Error updating mantra" });
  }
});

// UPDATE PLANNER (Dashboard Cards)
router.put("/update-planner", authMiddleware, async (req, res) => {
  try {
    const { planner } = req.body;
    
    // Inject the current date as the last updated time
    planner.lastUpdated = new Date();
    
    // Debug
    console.log("Saving planner:", planner);

    const updatedUser = await User.findByIdAndUpdate(
      req.user.userId,
      { 
        $set: { planner } 
      },
      { new: true }
    );

    res.json(updatedUser);
  } catch (error) {
    console.error("DEBUG Planner Error:", error);
    res.status(500).json({ message: "Error updating planner", details: error.message });
  }
});

// TEST DIGEST ENDPOINT
router.post("/test-digest", authMiddleware, async (req, res) => {
  try {
    // Generate and send for all users directly now:
    await generateAndSendWeeklyDigest();
    res.json({ message: "Test digest triggered successfully!" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;