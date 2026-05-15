const request = require("supertest");
const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");

const app = express();
app.use(express.json());

// Protected test route
app.get("/api/protected", authMiddleware, (req, res) => {
  res.status(200).json({
    message: "Access granted",
  });
});

describe("JEST_12 - JWT Middleware Validation", () => {
  test("Request should be blocked without valid JWT token", async () => {
    const response = await request(app)
      .get("/api/protected");

    expect(response.statusCode).toBe(401);
    expect(response.body.message).toBe("No token provided");
  });
});