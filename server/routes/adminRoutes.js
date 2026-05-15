const express = require("express");
const router = express.Router();
const adminMiddleware = require("../middleware/adminMiddleware");
const User = require("../models/User");
const Task = require("../models/Task");

// Returns summary statistics for admin dashboard

router.get("/stats", adminMiddleware, async (req, res) => {
  try {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - 7);

    const [
      totalUsers,
      dailyLogins,
      activeUsersToday,
      totalTasksCreated,
      newUsersThisWeek,
      totalStudents,
      totalProfessionals,
      inactiveUsers,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ lastLogin: { $gte: startOfToday } }),
      User.countDocuments({ isActive: true, lastLogin: { $gte: startOfToday } }),
      Task.countDocuments(),
      User.countDocuments({ createdAt: { $gte: startOfWeek } }),
      User.countDocuments({ role: "student" }),
      User.countDocuments({ role: "professional" }),
      User.countDocuments({ isActive: false }),
    ]);

    res.json({
      totalUsers,
      dailyLogins,
      activeUsersToday,
      totalTasksCreated,
      newUsersThisWeek,
      totalStudents,
      totalProfessionals,
      inactiveUsers,
    });
  } catch (error) {
    console.error("Admin stats error:", error);
    res.status(500).json({ message: "Server error fetching stats" });
  }
});


// Returns all users (paginated, searchable)

router.get("/users", adminMiddleware, async (req, res) => {
  try {
    const { search = "" } = req.query;

    const query = search
      ? {
          $or: [
            { fullName: { $regex: search, $options: "i" } },
            { email: { $regex: search, $options: "i" } },
          ],
        }
      : {};

    const users = await User.find(query)
      .select("-password -resetPasswordOTP -resetPasswordExpires -planner -dailyMantra -pomodoroSettings")
      .sort({ createdAt: -1 })
      .limit(100);

    res.json(users);
  } catch (error) {
    console.error("Admin users error:", error);
    res.status(500).json({ message: "Server error fetching users" });
  }
});


// Returns the 20 most recently active users

router.get("/activity", adminMiddleware, async (req, res) => {
  try {
    const recentUsers = await User.find({ lastLogin: { $ne: null } })
      .select("fullName email role lastLogin isActive roleType")
      .sort({ lastLogin: -1 })
      .limit(20);

    res.json(recentUsers);
  } catch (error) {
    console.error("Admin activity error:", error);
    res.status(500).json({ message: "Server error fetching activity" });
  }
});

module.exports = router;
