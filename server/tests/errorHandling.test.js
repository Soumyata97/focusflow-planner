const request = require("supertest");
const express = require("express");

const app = express();
app.use(express.json());

// Sample valid route
app.get("/api/test", (req, res) => {
  res.status(200).json({
    message: "Test route working",
  });
});

// Invalid route fallback
app.use((req, res) => {
  res.status(404).json({
    message: "Route not found",
  });
});

describe("JEST_20 - Error Handling Middleware Testing", () => {
  test("System should return proper error response without crashing", async () => {
    const response = await request(app)
      .get("/api/invalid-route");

    expect(response.statusCode).toBe(404);
    expect(response.body.message).toBe("Route not found");
  });
});