const express = require("express");
const router = express.Router();
const PomodoroSession = require("../models/PomodoroSession");
const Notification = require("../models/Notification");
const authMiddleware = require("../middleware/authMiddleware");

// START SESSION
router.post("/start", authMiddleware, async (req, res) => {
  try {
    const { taskId, subjectProjectId, type, duration, focusMode, breakDuration } = req.body;

    if (!taskId || !subjectProjectId || !type || !duration) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const newSession = new PomodoroSession({
      userId: req.user.userId,
      taskId,
      subjectProjectId,
      type,
      duration,
      focusMode: focusMode || "beginner",
      breakDuration: breakDuration || 5,
      startTime: new Date(),
      status: "running",
    });

    await newSession.save();

    res.status(201).json(newSession);
  } catch (error) {
    console.error("START POMODORO ERROR:", error);
    res.status(500).json({ message: "Error starting pomodoro session" });
  }
});

// END OR INTERRUPT SESSION
router.put("/end/:id", authMiddleware, async (req, res) => {
  try {
    const { status } = req.body; // should be "completed" or "interrupted"

    if (!["completed", "interrupted"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const updatedSession = await PomodoroSession.findOneAndUpdate(
      {
        _id: req.params.id,
        userId: req.user.userId,
        status: "running", 
      },
      {
        $set: {
          endTime: new Date(),
          status,
        },
      },
      { new: true }
    );

    if (!updatedSession) {
      return res
        .status(404)
        .json({ message: "Running session not found or unauthorized." });
    }

    // CREATE NOTIFICATION ON COMPLETION
    if (status === "completed") {
      try {
        const newNotif = new Notification({
          userId: req.user.userId,
          title: "Focus session complete!",
          message: `Great job! You've finished your ${updatedSession.duration}-minute focus session.`,
          type: "focus"
        });
        await newNotif.save();
      } catch (err) {
        console.error("NOTIFICATION ERROR:", err);
        
      }
    }

    res.json(updatedSession);
  } catch (error) {
    console.error("END POMODORO ERROR:", error);
    res.status(500).json({ message: "Error ending pomodoro session" });
  }
});

// GET SESSIONS (FILTERED BY TYPE AND DATE FOR TODAY'S LIST)
router.get("/", authMiddleware, async (req, res) => {
  try {
    const { type, date } = req.query;

    const query = {
      userId: req.user.userId,
    };

    if (type) {
      query.type = type;
    }

    // Optional date filter: "YYYY-MM-DD"
    if (date) {
      const startDate = new Date(date);
      startDate.setHours(0, 0, 0, 0);

      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + 1);

      query.createdAt = {
        $gte: startDate,
        $lt: endDate,
      };
    }

    const sessions = await PomodoroSession.find(query)
      .populate("taskId", "title")
      .populate("subjectProjectId", "name title") // title for subject, name for project? Subjects don't always have one model, ah wait, SubjectProject might have `name` or `title`. Let's populate and check later if needed.
      .sort({ createdAt: -1 });

    res.json(sessions);
  } catch (error) {
    console.error("FETCH POMODORO SESSIONS ERROR:", error);
    res.status(500).json({ message: "Error fetching sessions" });
  }
});

module.exports = router;
