const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const Task = require("../models/Task");
const PomodoroSession = require("../models/PomodoroSession");
const Routine = require("../models/Routine");
const SubjectProject = require("../models/SubjectProject");
const mongoose = require("mongoose");

// Helper to get date ranges
const getDateRange = (days) => {
  const end = new Date();
  const start = new Date();
  if (days === "all") {
    start.setFullYear(2020); 
  } else {
    start.setDate(start.getDate() - parseInt(days));
  }
  
  const prevStart = new Date(start);
  if (days !== "all") {
    prevStart.setDate(prevStart.getDate() - parseInt(days));
  }
  
  return { start, end, prevStart, prevEnd: start };
};

router.get("/overview", authMiddleware, async (req, res) => {
  try {
    const { days = "7", type = "student" } = req.query;
    const userId = req.user.userId || req.user.id;
    const { start, end, prevStart, prevEnd } = getDateRange(days);

    const userObjId = new mongoose.Types.ObjectId(userId);

    const actualDurationSum = {
      $sum: {
        $cond: {
          if: { $eq: ["$status", "completed"] },
          then: "$duration",
          else: {
            $cond: {
              if: { $and: [ { $ifNull: ["$endTime", false] }, { $ifNull: ["$startTime", false] } ] },
              then: { $round: [{ $divide: [{ $subtract: ["$endTime", "$startTime"] }, 60000] }, 0] },
              else: 0
            }
          }
        }
      }
    };

    // Total Focus Time
    const focusStats = await PomodoroSession.aggregate([
      { $match: { userId: userObjId, type, status: { $in: ["completed", "interrupted"] }, startTime: { $gte: start, $lte: end } } },
      { $group: { _id: null, total: actualDurationSum } }
    ]);
    
    const prevFocusStats = await PomodoroSession.aggregate([
      { $match: { userId: userObjId, type, status: { $in: ["completed", "interrupted"] }, startTime: { $gte: prevStart, $lte: prevEnd } } },
      { $group: { _id: null, total: actualDurationSum } }
    ]);

    const totalFocusTime = focusStats[0]?.total || 0;
    const prevTotalFocusTime = prevFocusStats[0]?.total || 0;
    const focusTrend = prevTotalFocusTime === 0 ? 0 : Math.round(((totalFocusTime - prevTotalFocusTime) / prevTotalFocusTime) * 100);

    //  Tasks Completed
    const tasksCompleted = await Task.countDocuments({ user: userObjId, status: "completed", updatedAt: { $gte: start, $lte: end } });
    const prevTasksCompleted = await Task.countDocuments({ user: userObjId, status: "completed", updatedAt: { $gte: prevStart, $lte: prevEnd } });
    const tasksTrend = prevTasksCompleted === 0 ? 0 : Math.round(((tasksCompleted - prevTasksCompleted) / prevTasksCompleted) * 100);

    // Efficiency Score
    const totalTasks = await Task.countDocuments({ user: userObjId, updatedAt: { $gte: start, $lte: end } });
    const efficiencyScore = totalTasks === 0 ? 0 : parseFloat(((tasksCompleted / totalTasks) * 5).toFixed(1));
    
    const prevTotalTasks = await Task.countDocuments({ user: userObjId, updatedAt: { $gte: prevStart, $lte: prevEnd } });
    const prevEfficiencyScore = prevTotalTasks === 0 ? 0 : parseFloat(((prevTasksCompleted / prevTotalTasks) * 5).toFixed(1));
    const efficiencyTrend = prevEfficiencyScore === 0 ? 0 : Math.round(((efficiencyScore - prevEfficiencyScore) / prevEfficiencyScore) * 100);

    //  Weekly Focus Activity (Bar)
    const weeklyFocusActivity = await PomodoroSession.aggregate([
      { $match: { userId: userObjId, type, status: { $in: ["completed", "interrupted"] }, startTime: { $gte: start, $lte: end } } },
      {
        $group: {
          _id: { $dayOfWeek: "$startTime" },
          minutes: actualDurationSum
        }
      },
      { $sort: { "_id": 1 } }
    ]);

    const daysMap = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const formattedWeekly = daysMap.map((day, index) => {
      const match = weeklyFocusActivity.find(d => d._id === index + 1);
      return { day, hours: match ? parseFloat((match.minutes / 60).toFixed(1)) : 0 };
    });

    // Productivity Trend (Line) - Last 4 Weeks
    const monthlyTrend = await PomodoroSession.aggregate([
      { 
        $match: { 
          userId: userObjId, 
          type, 
          status: { $in: ["completed", "interrupted"] }, 
          startTime: { $gte: new Date(new Date().setDate(new Date().getDate() - 28)) } 
        } 
      },
      {
        $group: {
          _id: { $week: "$startTime" },
          hours: actualDurationSum
        }
      },
      { $sort: { "_id": 1 } }
    ]);
    
    const productivityTrend = monthlyTrend.map((w, idx) => ({
      week: `Week ${idx + 1}`,
      value: Math.round(w.hours / 60)
    }));

    // Subject Allocation (Progress Bars)
    const allSubjects = await SubjectProject.find({ userId: userObjId, type }).lean();

    const subjectSessionGroups = await PomodoroSession.aggregate([
      { $match: { userId: userObjId, type, status: { $in: ["completed", "interrupted"] }, startTime: { $gte: start, $lte: end } } },
      {
        $group: {
          _id: "$subjectProjectId",
          minutes: actualDurationSum
        }
      }
    ]);

    const subjectMinutesMap = {};
    let generalMinutes = 0;

    subjectSessionGroups.forEach(g => {
      if (g._id) {
        subjectMinutesMap[String(g._id)] = g.minutes;
      } else {
        generalMinutes += g.minutes;
      }
    });

    let finalAllocation = allSubjects.map(sub => ({
      name: sub.name,
      color: sub.color || "#6c5ce7",
      minutes: subjectMinutesMap[String(sub._id)] || 0
    }));

    if (generalMinutes > 0) {
      finalAllocation.push({
        name: "Uncategorized",
        color: "#94a3b8",
        minutes: generalMinutes
      });
    }

    // Sort by minutes descending
    finalAllocation.sort((a, b) => b.minutes - a.minutes);
    
    // Take top 5
    const subjectAllocation = finalAllocation.slice(0, 5);

    // CHART: Task Status 
    const taskStatusCounts = await Task.aggregate([
      { $match: { user: userObjId, updatedAt: { $gte: start, $lte: end } } },
      { $group: { _id: "$status", count: { $sum: 1 } } }
    ]);

    const totalTaskStatus = taskStatusCounts.reduce((acc, curr) => acc + curr.count, 0);
    const taskStatus = taskStatusCounts.map(t => ({
      name: t._id.charAt(0).toUpperCase() + t._id.slice(1),
      value: t.count,
      percentage: Math.round((t.count / totalTaskStatus) * 100)
    }));

    // STREAK DATA
    const routines = await Routine.find({ userId: userObjId, type });
    const maxStreak = routines.length > 0 ? Math.max(...routines.map(r => r.streakCount || 0)) : 0;

    res.json({
      totalFocusTime: { value: totalFocusTime, trend: focusTrend },
      tasksCompleted: { value: tasksCompleted, trend: tasksTrend },
      efficiencyScore: { value: efficiencyScore, trend: efficiencyTrend },
      weeklyFocusActivity: formattedWeekly,
      productivityTrend: productivityTrend,
      subjectAllocation: subjectAllocation.map(s => ({
        name: s.name,
        hours: `${Math.floor(s.minutes / 60)}h ${s.minutes % 60}m`,
        percentage: Math.min(100, Math.round((s.minutes / (totalFocusTime || 1)) * 100)),
        color: s.color
      })),
      taskStatus,
      totalTaskStatus,
      streakData: maxStreak
    });

  } catch (error) {
    console.error("ANALYTICS FETCH ERROR:", error);
    res.status(500).json({ error: "Failed to fetch analytics" });
  }
});

module.exports = router;
