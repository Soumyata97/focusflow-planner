const request = require("supertest");
const express = require("express");
const taskRoutes = require("../routes/taskRoutes");
const Task = require("../models/Task");
const Notification = require("../models/Notification");

// Mock auth middleware
jest.mock("../middleware/authMiddleware", () => (req, res, next) => {
  req.user = {
    userId: "mock-user-id",
  };
  next();
});

jest.mock("../models/Task");
jest.mock("../models/Notification");
jest.mock("../models/TimelineEntry");

const app = express();
app.use(express.json());
app.use("/api/tasks", taskRoutes);

describe("JEST_21 - Notification Trigger Function Testing", () => {
  test("Notification function should execute successfully", async () => {
    Task.prototype.save = jest.fn().mockResolvedValue();
    Notification.prototype.save = jest.fn().mockResolvedValue();

    const response = await request(app)
      .post("/api/tasks")
      .send({
        title: "Important Deadline Task",
        dueDate: "2099-12-31",
        priority: "High",
      });

    expect(response.statusCode).toBe(201);
    expect(Notification.prototype.save).toHaveBeenCalled();
  });
});