const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const Task = require("../models/Task");
const PomodoroSession = require("../models/PomodoroSession");
const Routine = require("../models/Routine");

router.get("/dashboard", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const last7Days = new Date(today);
    last7Days.setDate(last7Days.getDate() - 7);

    //  TODAY'S TASKS
    const todayTasks = await Task.find({
      user: userId,
      dueDate: { $gte: today, $lt: tomorrow }
    });

    const todayTasksRemaining = todayTasks.filter(t => t.status !== "completed").length;
    const todayTasksTotal = todayTasks.length;
    const completedToday = todayTasks.filter(t => t.status === "completed").length;

    //  FOCUS TIME TODAY
    const sessionsToday = await PomodoroSession.find({
      userId: userId,
      createdAt: { $gte: today, $lt: tomorrow }
    });
    
    let focusTimeToday = 0;
    sessionsToday.forEach(s => {
      if (s.status === "completed") {
        focusTimeToday += s.duration;
      } else if (s.status === "interrupted" && s.startTime && s.endTime) {
        const diffMins = Math.round((new Date(s.endTime) - new Date(s.startTime)) / 60000);
        focusTimeToday += diffMins;
      }
    });

    // COMPLETED
    const completedLast7Days = await Task.countDocuments({
      user: userId,
      status: "completed",
      completedAt: { $gte: last7Days, $lt: tomorrow }
    });

    // STREAK (Sync with routines page calculation)
    const userRoutines = await Routine.find({ userId: userId });
    let currentStreak = 0;
    if (userRoutines && userRoutines.length > 0) {
      currentStreak = Math.max(...userRoutines.map(r => r.streakCount || 0));
    }

    res.json({
      todayTasksRemaining,
      todayTasksTotal,
      focusTimeToday,
      focusTarget: 120, 
      completedToday,
      completedLast7Days,
      currentStreak
    });
  } catch (error) {
    console.error("STATS FETCH ERROR:", error);
    res.status(500).json({ error: "Failed to fetch stats" });
  }
});

module.exports = router;
