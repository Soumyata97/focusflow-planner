const express = require("express");
const router = express.Router();
const Task = require("../models/Task");
const TimelineEntry = require("../models/TimelineEntry");
const Notification = require("../models/Notification");
const authMiddleware = require("../middleware/authMiddleware");



// CREATE TASK

router.post("/", authMiddleware, async (req, res) => {
  try {
    const { title, subject, priority, dueDate, subjectProjectId } = req.body;

    if (!title) {
      return res.status(400).json({ message: "Title is required" });
    }

    const newTask = new Task({
      title,
      subject: subject || "General",
      subjectProjectId,
      priority: priority || "Medium",
      dueDate,
      user: req.user.userId, 
    });

    await newTask.save();

    if (dueDate) {
      try {
        const notif = new Notification({
          userId: req.user.userId,
          title: "New Deadline Tracked",
          message: `Task "${title}" scheduled. Due: ${new Date(dueDate).toLocaleDateString()}`,
          type: "deadline"
        });
        await notif.save();
      } catch (err) {
        console.error("Failed to create deadline notification", err);
      }
    }

    res.status(201).json(newTask);
  } catch (error) {
    console.error("CREATE TASK ERROR:", error);
    res.status(500).json({ message: "Error creating task" });
  }
});



// GET ALL TASKS (USER-SPECIFIC)

router.get("/", authMiddleware, async (req, res) => {
  try {
    const tasks = await Task.find({ user: req.user.userId }).sort({ createdAt: -1 });
    res.json(tasks);
  } catch (error) {
    console.error("FETCH TASKS ERROR:", error);
    res.status(500).json({ message: "Error fetching tasks" });
  }
});



// UPDATE TASK

router.put("/:id", authMiddleware, async (req, res) => {
  try {
    const updatedTask = await Task.findOneAndUpdate(
      {
        _id: req.params.id,
        user: req.user.userId, 
      },
      { $set: req.body },
      { new: true }
    );

    if (!updatedTask) {
      return res.status(404).json({ message: "Task not found or unauthorized" });
    }

    //  SYNC TO TIMELINE + COMPLETED_AT
    if (req.body.status) {
      const isCompleted = req.body.status === "completed";
      const timelineStatus = isCompleted ? "completed" : "scheduled";
      
      // Update entry with completedAt if needed
      const updatePayload = { $set: { status: req.body.status } };
      if (isCompleted) {
        updatePayload.$set.completedAt = new Date();
      } else {
        updatePayload.$set.completedAt = null;
      }

      const finalTask = await Task.findOneAndUpdate(
        { _id: updatedTask._id },
        updatePayload,
        { new: true }
      );

      await TimelineEntry.updateMany(
        { taskId: updatedTask._id, userId: req.user.userId },
        { $set: { status: timelineStatus } }
      );

      if (isCompleted) {
        try {
          const notif = new Notification({
            userId: req.user.userId,
            title: "Task Completed! ",
            message: `Great job wrapping up "${updatedTask.title}"!`,
            type: "task"
          });
          await notif.save();
        } catch (err) {
          console.error("Failed to create task completion notification", err);
        }
      }
    }

    res.json(updatedTask);
  } catch (error) {
    console.error("UPDATE TASK ERROR:", error);
    res.status(500).json({ message: "Error updating task" });
  }
});



// DELETE TASK


router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const deletedTask = await Task.findOneAndDelete({
      _id: req.params.id,
      user: req.user.userId, 
    });

    if (!deletedTask) {
      return res.status(404).json({ message: "Task not found or unauthorized" });
    }

    res.json({ message: "Task deleted successfully" });
  } catch (error) {
    console.error("DELETE TASK ERROR:", error);
    res.status(500).json({ message: "Error deleting task" });
  }
});

module.exports = router;