const request = require("supertest");
const express = require("express");
const authRoutes = require("../routes/authRoutes");
const User = require("../models/User");

jest.mock("../models/User");
jest.mock("../utils/emailService", () => ({
  sendWelcomeEmail: jest.fn(),
  sendOTPEmail: jest.fn(),
  sendRegistrationOTPEmail: jest.fn(),
}));

const app = express();
app.use(express.json());
app.use("/api/auth", authRoutes);

describe("JEST_17 - OTP Verification Function Testing", () => {
  test("should verify correct OTP successfully", async () => {
    User.findOne.mockResolvedValue({
      email: "test@gmail.com",
      resetPasswordOTP: "123456",
    });

    const response = await request(app)
      .post("/api/auth/verify-otp")
      .send({
        email: "test@gmail.com",
        otp: "123456",
      });

    expect(response.statusCode).toBe(200);
    expect(response.body.message).toBe("OTP verified correctly");
  });

  test("should reject incorrect OTP", async () => {
    User.findOne.mockResolvedValue(null);

    const response = await request(app)
      .post("/api/auth/verify-otp")
      .send({
        email: "test@gmail.com",
        otp: "999999",
      });

    expect(response.statusCode).toBe(400);
    expect(response.body.message).toBe("Invalid or expired OTP");
  });
});