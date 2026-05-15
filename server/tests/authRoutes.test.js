const request = require("supertest");
const express = require("express");
const bcrypt = require("bcryptjs");
const authRoutes = require("../routes/authRoutes");
const User = require("../models/User");

jest.mock("../models/User");
jest.mock("bcryptjs");

jest.mock("jsonwebtoken", () => ({
  sign: jest.fn(() => "mock-jwt-token"),
}));

jest.mock("../utils/emailService", () => ({
  sendWelcomeEmail: jest.fn(),
  sendOTPEmail: jest.fn(),
  sendRegistrationOTPEmail: jest.fn(),
  
}));

const app = express();
app.use(express.json());
app.use("/api/auth", authRoutes);

describe("JEST_13 - Authentication Controller Testing", () => {
  test("should return error for invalid login credentials", async () => {
    User.findOne.mockResolvedValue(null);

    const response = await request(app)
      .post("/api/auth/login")
      .send({
        email: "wrong@gmail.com",
        password: "wrongpass",
      });

    expect(response.statusCode).toBe(400);
    expect(response.body.message).toBe("Invalid credentials");
  });

  test("should login successfully with valid credentials", async () => {
    const mockUser = {
      _id: "123456",
      email: "test@gmail.com",
      password: "hashedpassword",
      roleType: "user",
      _doc: {
        _id: "123456",
        email: "test@gmail.com",
        roleType: "user",
      },
      save: jest.fn(),
    };

    User.findOne.mockResolvedValue(mockUser);
    bcrypt.compare.mockResolvedValue(true);

    const response = await request(app)
      .post("/api/auth/login")
      .send({
        email: "test@gmail.com",
        password: "correctpassword",
      });

    expect(response.statusCode).toBe(200);
    expect(response.body.message).toBe("Login successful");
    expect(response.body.token).toBeDefined();
  });
});