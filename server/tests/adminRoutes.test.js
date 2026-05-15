const request = require("supertest");
const express = require("express");
const adminRoutes = require("../routes/adminRoutes");

// Mock admin middleware - deny access like normal user
jest.mock("../middleware/adminMiddleware", () => (req, res, next) => {
  return res.status(403).json({
    message: "Access denied. Admin only.",
  });
});

const app = express();
app.use(express.json());
app.use("/api/admin", adminRoutes);

describe("JEST_15 - Admin Role Access Validation", () => {
  test("Access should be denied for unauthorized users", async () => {
    const response = await request(app)
      .get("/api/admin/stats");

    expect(response.statusCode).toBe(403);
    expect(response.body.message).toBe("Access denied. Admin only.");
  });
});