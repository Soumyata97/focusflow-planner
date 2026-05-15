const request = require("supertest");
const express = require("express");
const protectedRoutes = require("../routes/protectedRoutes");

const app = express();
app.use(express.json());

app.use("/api/protected", protectedRoutes);

describe("JEST_03 - Protected Route Redirect", () => {
  test("should deny access without authentication token", async () => {
    const response = await request(app)
      .get("/api/protected/dashboard");

    expect(response.statusCode).toBe(401);
    expect(response.body.message).toBe("No token provided");
  });
});