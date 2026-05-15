const cron = require("node-cron");
const User = require("../models/User");
const Task = require("../models/Task");
const TimelineEntry = require("../models/TimelineEntry");
const Routine = require("../models/Routine");
const Notification = require("../models/Notification");

const notifyTimedEvents = async () => {
  const now = new Date();
  const hours = now.getHours().toString().padStart(2, "0");
  const minutes = now.getMinutes().toString().padStart(2, "0");
  const timeStr = `${hours}:${minutes}`;
  const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const dayName = dayNames[now.getDay()];

  console.log(`[CRON] Checking events for ${dateStr} ${timeStr} (${dayName})...`);

  try {
    // TIMELINE ENTRIES
    const timelineEvents = await TimelineEntry.find({
      date: dateStr,
      startTime: timeStr,
      status: "scheduled"
    });

    for (const event of timelineEvents) {
      const exists = await Notification.findOne({
        userId: event.userId,
        type: "planner",
        message: { $regex: event.title, $options: "i" },
        createdAt: { $gte: new Date(now.getTime() - 60000) } // Check last minute
      });

      if (!exists) {
        await new Notification({
          userId: event.userId,
          title: "Session Starting!",
          message: `It's time for: ${event.title}`,
          type: "planner"
        }).save();
        console.log(`- Created notification for Timeline: ${event.title}`);
      }
    }

    // ROUTINES
    // Logic: Trigger notification if the routine missed completion today (Not in completedDays)
    const activeRoutines = await Routine.find({
      startTime: timeStr,
      completedDays: { $ne: dateStr }, // Trigger when NOT completed today
      $or: [
        { frequency: "Daily" },
        { frequency: dayName }
      ]
    });

    for (const routine of activeRoutines) {
      const exists = await Notification.findOne({
        userId: routine.userId,
        type: "routine",
        message: { $regex: routine.title, $options: "i" },
        createdAt: { $gte: new Date(now.getTime() - 60000) }
      });

      if (!exists) {
        await new Notification({
          userId: routine.userId,
          title: "Routine Alert!",
          message: `Time to perform your routine: ${routine.title}`,
          type: "routine"
        }).save();
        console.log(`- Created notification for Routine: ${routine.title}`);
      }
    }

  } catch (error) {
    console.error("[CRON] Error in notifyTimedEvents:", error);
  }
};

const initCronJobs = () => {
  // Check for Timeline/Routine alerts every minute
  cron.schedule("* * * * *", () => {
    notifyTimedEvents();
  });

  console.log("Cron Jobs Initialized (Minute Alerts).");
};

module.exports = { initCronJobs };
