const express = require("express");
const router = express.Router();
const Routine = require("../models/Routine");
const authMiddleware = require("../middleware/authMiddleware");


//  Get all routines for the user (filtered by type/role)

router.get("/", authMiddleware, async (req, res) => {
  try {
    const { type } = req.query;
    const userId = req.user.userId || req.user.id;

    if (!type) {
      return res.status(400).json({ message: "Type (role) is required" });
    }

    const routines = await Routine.find({ userId, type });

    // Recalculate and persist streak / completion-rate for every routine
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const updatePromises = routines.map(async (routine) => {
      const freshStreak = calculateStreak(routine.completedDays);
      const createdAt = new Date(routine.createdAt);
      createdAt.setHours(0, 0, 0, 0);
      const diffDays = Math.floor((today - createdAt) / (1000 * 60 * 60 * 24)) + 1;
      const freshRate = diffDays > 0
        ? Math.min(Math.round((routine.completedDays.length / diffDays) * 100), 100)
        : 0;

      // Only write to DB if something actually changed
      if (routine.streakCount !== freshStreak || routine.completionRate !== freshRate) {
        routine.streakCount = freshStreak;
        routine.completionRate = freshRate;
        await routine.save();
      }

      return routine;
    });

    const updatedRoutines = await Promise.all(updatePromises);
    res.json(updatedRoutines);
  } catch (error) {
    console.error("Fetch Routines Error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// @route   POST /api/routines
// @desc    Create a new routine
router.post("/", authMiddleware, async (req, res) => {
  try {
    console.log("DEBUG - REQ.USER:", req.user); // Added for troubleshooting
    
    const {
      title,
      description,
      type,
      category,
      startTime,
      endTime,
      frequency,
      iconName,
      color,
    } = req.body;

    const extractedUserId = req.user.userId || req.user.id;

    if (!extractedUserId) {
      console.error("ERROR: No User ID found in token!");
      return res.status(401).json({ message: "Invalid session. Please log out and log in again." });
    }

    const newRoutine = new Routine({
      title,
      description,
      userId: extractedUserId,
      type,
      category,
      startTime,
      endTime,
      frequency,
      iconName,
      color,
      isActive: false, // Ensure new routines start as Undone
    });

    const savedRoutine = await newRoutine.save();
    res.status(201).json(savedRoutine);
  } catch (error) {
    console.error("Create Routine VALIDATION ERROR:", error.message);
    res.status(500).json({ message: "Server error: " + error.message });
  }
});

// @route   PUT /api/routines/:id
// @desc    Update a routine
router.put("/:id", authMiddleware, async (req, res) => {
  try {
    const routine = await Routine.findById(req.params.id);

    if (!routine) return res.status(404).json({ message: "Routine not found" });

    const extractedUserId = req.user.userId || req.user.id;

    // Check ownership
    if (routine.userId.toString() !== extractedUserId) {
      return res.status(401).json({ message: "Not authorized" });
    }

    const updatedRoutine = await Routine.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );

    res.json(updatedRoutine);
  } catch (error) {
    console.error("Update Routine Error:", error);
    res.status(500).json({ message: "Server error" });
  }
});


//  Delete a routine
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const routine = await Routine.findById(req.params.id);

    if (!routine) return res.status(404).json({ message: "Routine not found" });

    const extractedUserId = req.user.userId || req.user.id;

    // Check ownership
    if (routine.userId.toString() !== extractedUserId) {
      return res.status(401).json({ message: "Not authorized" });
    }

    await Routine.findByIdAndDelete(req.params.id);
    res.json({ message: "Routine removed" });
  } catch (error) {
    console.error("Delete Routine Error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Toggle routine active status
router.patch("/:id/toggle", authMiddleware, async (req, res) => {
  try {
    const routine = await Routine.findById(req.params.id);

    if (!routine) return res.status(404).json({ message: "Routine not found" });

    const extractedUserId = req.user.userId || req.user.id;

    if (routine.userId.toString() !== extractedUserId) {
      return res.status(401).json({ message: "Not authorized" });
    }

    routine.isActive = !routine.isActive;
    await routine.save();

    res.json(routine);
  } catch (error) {
    console.error("Toggle Routine Error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

//   Mark routine as completed for today
router.patch("/:id/complete", authMiddleware, async (req, res) => {
  try {
    const routine = await Routine.findById(req.params.id);

    if (!routine) return res.status(404).json({ message: "Routine not found" });

    const extractedUserId = req.user.userId || req.user.id;

    if (routine.userId.toString() !== extractedUserId) {
      return res.status(401).json({ message: "Not authorized" });
    }

    const { date } = req.body;
    const now = new Date();
    const serverDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    const todayDate = date || serverDate;

    if (routine.completedDays.includes(todayDate)) {
      // Un-complete if already done (toggle functionality)
      routine.completedDays = routine.completedDays.filter((d) => d !== todayDate);
    } else {
      routine.completedDays.push(todayDate);
    }

    routine.markModified('completedDays');

    // CALCULATE STREAK AUTOMATICALLY
    routine.streakCount = calculateStreak(routine.completedDays);

    // CALCULATE COMPLETION RATE AUTOMATICALLY
    const createdAt = new Date(routine.createdAt);
    const today = new Date();
    today.setHours(0,0,0,0);
    createdAt.setHours(0,0,0,0);
    
    const diffTime = Math.abs(today - createdAt);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;
    
    routine.completionRate = Math.round((routine.completedDays.length / diffDays) * 100);
    if (routine.completionRate > 100) routine.completionRate = 100;

    await routine.save();
    res.json(routine);
  } catch (error) {
    console.error("Complete Routine Error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Robust streak calculation logic
function calculateStreak(completedDays) {
  if (!completedDays || completedDays.length === 0) return 0;

  // Sort unique dates descending
  const sortedDays = [...new Set(completedDays)].sort((a, b) => new Date(b) - new Date(a));
  
  const today = new Date();
  today.setHours(0,0,0,0);
  
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  let currentStreak = 0;
  let dateToCheck = new Date(sortedDays[0]);
  dateToCheck.setHours(0,0,0,0);

  // If the most recent completion is neither today nor yesterday, the streak is broken
  if (dateToCheck < yesterday) return 0;

  // Start checking backwards day by day from the most recent completion
  for (let i = 0; i < sortedDays.length; i++) {
    const compDate = new Date(sortedDays[i]);
    compDate.setHours(0,0,0,0);
    
    const expectedDate = new Date(sortedDays[0]);
    expectedDate.setDate(expectedDate.getDate() - i);
    expectedDate.setHours(0,0,0,0);

    if (compDate.getTime() === expectedDate.getTime()) {
      currentStreak++;
    } else {
      break;
    }
  }

  return currentStreak;
}

module.exports = router;
