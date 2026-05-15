const request = require("supertest");
const express = require("express");
const authRoutes = require("../routes/authRoutes");
const User = require("../models/User");

jest.mock("../models/User");
jest.mock("../utils/emailService", () => ({
  sendWelcomeEmail: jest.fn(),
  sendOTPEmail: jest.fn(() => Promise.resolve()),
  sendRegistrationOTPEmail: jest.fn(),
}));

const app = express();
app.use(express.json());
app.use("/api/auth", authRoutes);

describe("JEST_16 - Forgot Password API Testing", () => {
  test("Reset password OTP should be generated successfully", async () => {
    const mockUser = {
      email: "test@gmail.com",
      resetPasswordOTP: null,
      resetPasswordExpires: null,
      save: jest.fn().mockResolvedValue(),
    };

    User.findOne.mockResolvedValue(mockUser);

    const response = await request(app)
      .post("/api/auth/forgot-password")
      .send({
        email: "test@gmail.com",
      });

    expect(response.statusCode).toBe(200);
    expect(response.body.message).toBe("OTP sent to your email");
  });
});