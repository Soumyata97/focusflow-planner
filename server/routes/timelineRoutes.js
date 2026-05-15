const express = require("express");
const router = express.Router();
const TimelineEntry = require("../models/TimelineEntry");
const Task = require("../models/Task");
const authMiddleware = require("../middleware/authMiddleware");

const timeToMinutes = (timeStr) => {
  if (!timeStr || !timeStr.includes(":")) return 0;
  const [hours, minutes] = timeStr.split(":").map(Number);
  return hours * 60 + minutes;
};

// CREATE
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { taskId, subjectProjectId, title, date, startTime, endTime, type, color } = req.body;

    if (!title || !date || !startTime || !endTime || !type) {
      return res.status(400).json({ error: "title, date, startTime, endTime, and type are required." });
    }

    const startMins = timeToMinutes(startTime);
    const endMins = timeToMinutes(endTime);

    if (startMins >= endMins) {
      return res.status(400).json({ error: "End time must be after start time." });
    }

    // Overlap check
    const existing = await TimelineEntry.find({ userId: req.user.userId, date });
    const hasOverlap = existing.some(e => {
      const eS = timeToMinutes(e.startTime);
      const eE = timeToMinutes(e.endTime);
      return Math.max(startMins, eS) < Math.min(endMins, eE);
    });
    if (hasOverlap) {
      return res.status(400).json({ error: "This time block overlaps with an existing schedule." });
    }

    const payload = {
      userId: req.user.userId,
      title,
      date,
      startTime,
      endTime,
      duration: endMins - startMins,
      type,
      color: color || "#6c5ce7",
    };

    // Only attach IDs if they are valid non-empty strings
    if (taskId && String(taskId).trim()) payload.taskId = taskId;
    if (subjectProjectId && String(subjectProjectId).trim()) payload.subjectProjectId = subjectProjectId;

    const entry = new TimelineEntry(payload);
    await entry.save();
    res.status(201).json(entry);
  } catch (err) {
    console.error("TIMELINE POST ERROR:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// GET by date + type
router.get("/", authMiddleware, async (req, res) => {
  try {
    const { date, type } = req.query;
    const query = { userId: req.user.userId };
    if (date) query.date = date;
    if (type) query.type = type;
    const entries = await TimelineEntry.find(query).sort({ startTime: 1 });
    res.json(entries);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// UPDATE
router.put("/:id", authMiddleware, async (req, res) => {
  try {
    const entry = await TimelineEntry.findOne({ _id: req.params.id, userId: req.user.userId });
    if (!entry) return res.status(404).json({ error: "Entry not found" });

    const { startTime, endTime, status, title, color } = req.body;
    let duration = entry.duration;

    console.log(`Updating entry ${req.params.id} with color: ${color}`);

    if (startTime && endTime && (startTime !== entry.startTime || endTime !== entry.endTime)) {
      const sM = timeToMinutes(startTime);
      const eM = timeToMinutes(endTime);
      if (sM >= eM) return res.status(400).json({ error: "End time must be after start time" });

      const existing = await TimelineEntry.find({ userId: req.user.userId, date: entry.date, _id: { $ne: entry._id } });
      const hasOverlap = existing.some(e => Math.max(sM, timeToMinutes(e.startTime)) < Math.min(eM, timeToMinutes(e.endTime)));
      if (hasOverlap) return res.status(400).json({ error: "Time block overlaps with existing schedule" });

      duration = eM - sM;
    }

    if (status && entry.taskId) {
      if (status === "completed") {
        await Task.findByIdAndUpdate(entry.taskId, { 
          status: "completed",
          completedAt: new Date()
        });
      } else if (status === "scheduled") {
        await Task.findByIdAndUpdate(entry.taskId, { 
          status: "pending",
          completedAt: null
        });
      }
    }

    const updateFields = { duration };
    if (title !== undefined) updateFields.title = title;
    if (startTime !== undefined) updateFields.startTime = startTime;
    if (endTime !== undefined) updateFields.endTime = endTime;
    if (status !== undefined) updateFields.status = status;
    if (color !== undefined) updateFields.color = color;

    const updated = await TimelineEntry.findByIdAndUpdate(
      req.params.id,
      { $set: updateFields },
      { new: true }
    );
    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// DELETE
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const deleted = await TimelineEntry.findOneAndDelete({ _id: req.params.id, userId: req.user.userId });
    if (!deleted) return res.status(404).json({ error: "Entry not found" });
    res.json({ message: "Deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
