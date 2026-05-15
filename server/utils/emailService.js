const nodemailer = require("nodemailer");

/**
 * FocusFlow Email Service
 */

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || "smtp.gmail.com",
  port: process.env.EMAIL_PORT || 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendWelcomeEmail = async (userEmail, fullName) => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.warn("Email credentials not set in .env. Skipping welcome email.");
    return;
  }

  const firstName = fullName.split(" ")[0];

  const htmlContent = `
    <p>Hi ${firstName},</p>
    <p>Congratulations! Your account is officially registered.</p>
    <p>We are thrilled to have you join our community. FocusFlow is designed to help you organize your day with clarity and precision.</p>
    <br>
    <p>Thanks,</p>
    <p>FocusFlow Planner</p>
  `;

  try {
    const info = await transporter.sendMail({
      from: `"FocusFlow Planner" <${process.env.EMAIL_USER}>`,
      to: userEmail,
      subject: "Congratulations! Welcome to FocusFlow",
      html: htmlContent,
    });
    console.log("Welcome email sent successfully:", info.messageId);
  } catch (error) {
    console.error("Error sending welcome email:", error.message);
  }
};

const sendOTPEmail = async (userEmail, otp) => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.warn("Email credentials not set in .env. Skipping OTP email.");
    return;
  }

  const htmlContent = `
    <p>Hello,</p>
    <p>We received a request to reset your FocusFlow Planner password. Use the following code to continue:</p>
    <p><strong>${otp}</strong></p>
    <p>This code is valid for 5 minutes. If you did not request this, please ignore this email or contact support.</p>
    <br>
    <p>Thanks,</p>
    <p>FocusFlow Planner</p>
  `;

  try {
    const info = await transporter.sendMail({
      from: `"FocusFlow Security" <${process.env.EMAIL_USER}>`,
      to: userEmail,
      subject: `Your Password Recovery Code: ${otp}`,
      html: htmlContent,
    });
    console.log("OTP email sent successfully:", info.messageId);
  } catch (error) {
    console.error("Error sending OTP email:", error.message);
  }
};

const sendRegistrationOTPEmail = async (userEmail, otp) => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.warn("Email credentials not set in .env. Skipping registration OTP email.");
    return;
  }

  const htmlContent = `
    <p>Hey,</p>
    <p>Here's your code to finish signing up for FocusFlow:</p>
    <p style="font-size:32px; font-weight:bold; letter-spacing:8px; color:#6c5ce7;">${otp}</p>
    <p>It's only valid for 10 minutes, so use it soon.</p>
    <p>If you didn't try to sign up, just ignore this — nothing will happen.</p>
    <br>
    <p>— The FocusFlow team</p>
  `;

  try {
    const info = await transporter.sendMail({
      from: `"FocusFlow" <${process.env.EMAIL_USER}>`,
      to: userEmail,
      subject: `${otp} is your FocusFlow sign-up code`,
      html: htmlContent,
    });
    console.log("Registration OTP email sent:", info.messageId);
  } catch (error) {
    console.error("Error sending registration OTP email:", error.message);
    throw error;
  }
};

module.exports = { sendWelcomeEmail, sendOTPEmail, sendRegistrationOTPEmail };

