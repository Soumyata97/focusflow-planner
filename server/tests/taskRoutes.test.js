const request = require("supertest");
const express = require("express");
const taskRoutes = require("../routes/taskRoutes");
const Task = require("../models/Task");
const TimelineEntry = require("../models/TimelineEntry");
const Notification = require("../models/Notification");

// Mock auth middleware
jest.mock("../middleware/authMiddleware", () => (req, res, next) => {
  req.user = {
    userId: "mock-user-id",
  };
  next();
});

jest.mock("../models/Task");
jest.mock("../models/TimelineEntry");
jest.mock("../models/Notification");

const app = express();
app.use(express.json());
app.use("/api/tasks", taskRoutes);

describe("JEST_14 - Task API CRUD Testing", () => {
  test("should create a task successfully", async () => {
    Task.prototype.save = jest.fn().mockResolvedValue();

    const response = await request(app)
      .post("/api/tasks")
      .send({
        title: "Jest Testing Task",
        subject: "Software Engineering",
        priority: "High",
      });

    expect(response.statusCode).toBe(201);
  });

  test("should fetch all tasks successfully", async () => {
    Task.find.mockReturnValue({
      sort: jest.fn().mockResolvedValue([
        {
          title: "Task 1",
        },
      ]),
    });

    const response = await request(app)
      .get("/api/tasks");

    expect(response.statusCode).toBe(200);
    expect(response.body.length).toBeGreaterThan(0);
  });

  test("should update a task successfully", async () => {
    Task.findOneAndUpdate.mockResolvedValue({
      _id: "task-id",
      title: "Updated Task",
      status: "completed",
    });

    TimelineEntry.updateMany.mockResolvedValue({});
    Notification.prototype.save = jest.fn().mockResolvedValue();

    const response = await request(app)
      .put("/api/tasks/task-id")
      .send({
        status: "completed",
      });

    expect(response.statusCode).toBe(200);
  });

  test("should delete a task successfully", async () => {
    Task.findOneAndDelete.mockResolvedValue({
      _id: "task-id",
    });

    const response = await request(app)
      .delete("/api/tasks/task-id");

    expect(response.statusCode).toBe(200);
    expect(response.body.message).toBe("Task deleted successfully");
  });
});