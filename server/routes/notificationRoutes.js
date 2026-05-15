const express = require("express");
const router = express.Router();
const Notification = require("../models/Notification");
const Task = require("../models/Task");
const authMiddleware = require("../middleware/authMiddleware");

// Helper to generate dynamic deadline notifications
const generateDeadlineAlerts = async (userId) => {
  try {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);

    const dueTasks = await Task.find({
      user: userId,
      status: { $ne: "completed" },
      dueDate: { $gte: startOfToday, $lte: endOfToday }
    });

    for (let task of dueTasks) {
      // Avoid creating multiple notifications for the same task in the same day
      const exists = await Notification.findOne({
        userId,
        type: "deadline",
        message: { $regex: task.title, $options: "i" },
        createdAt: { $gte: startOfToday }
      });

      if (!exists) {
        await new Notification({
          userId,
          title: "Deadline Today!",
          message: `Your task "${task.title}" is due today.`,
          type: "deadline"
        }).save();
      }
    }
  } catch (error) {
    console.error("Error generating deadline alerts:", error);
  }
};

// FETCH NOTIFICATIONS
router.get("/", authMiddleware, async (req, res) => {
  try {
    // Dynamically check and generate alerts for today's deadlines
    await generateDeadlineAlerts(req.user.userId);

    const notifications = await Notification.find({ userId: req.user.userId })
      .sort({ createdAt: -1 })
      .limit(50);
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: "Error fetching notifications" });
  }
});

// MARK SINGLE NOTIFICATION AS READ
router.put("/:id/read", authMiddleware, async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.userId },
      { isRead: true },
      { new: true }
    );
    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }
    res.json(notification);
  } catch (error) {
    res.status(500).json({ message: "Error marking notification as read" });
  }
});

// MARK ALL NOTIFICATIONS AS READ
router.put("/mark-all-read", authMiddleware, async (req, res) => {
  try {
    await Notification.updateMany(
      { userId: req.user.userId, isRead: false },
      { isRead: true }
    );
    res.json({ message: "All notifications marked as read" });
  } catch (error) {
    res.status(500).json({ message: "Error marking all as read" });
  }
});



module.exports = router;
