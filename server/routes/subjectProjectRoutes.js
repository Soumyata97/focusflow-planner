const express = require("express");
const router = express.Router();
const SubjectProject = require("../models/SubjectProject");
const Task = require("../models/Task");
const authMiddleware = require("../middleware/authMiddleware");

// GET all subjects/projects for logged-in user
router.get("/", authMiddleware, async (req, res) => {
  try {
    const items = await SubjectProject.find({ userId: req.user.userId }).sort({ createdAt: -1 }).lean();
    
    // Fetch all user tasks to calculate remaining counts and progress
    const tasks = await Task.find({ user: req.user.userId }).lean();
    
    const itemsWithStats = items.map(item => {
      const projectTasks = tasks.filter(t => t.subjectProjectId && t.subjectProjectId.toString() === item._id.toString());
      const totalTasks = projectTasks.length;
      const completedTasks = projectTasks.filter(t => t.status === "completed").length;
      const tasksLeft = totalTasks - completedTasks;
      const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
      
      return {
        ...item,
        totalTasks,
        completedTasks,
        tasksLeft,
        progress,
        tasks: projectTasks
      };
    });

    res.json(itemsWithStats);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch subjects/projects" });
  }
});

// POST a new subject/project
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { name, description, type, color, status, dueDate, tags } = req.body;
    
    if (!name || !type) {
      return res.status(400).json({ error: "Name and type are required" });
    }

    const newItem = new SubjectProject({
      name,
      description,
      userId: req.user.userId,
      type,
      color,
      status,
      tags: tags || [],
      dueDate: dueDate ? dueDate : undefined,
    });

    const savedItem = await newItem.save();
    res.status(201).json(savedItem);
  } catch (err) {
    console.error("CREATE ERROR:", err);
    res.status(500).json({ error: err.message || "Failed to create subject/project" });
  }
});

// PUT update a subject/project
router.put("/:id", authMiddleware, async (req, res) => {
  try {
    const itemToUpdate = await SubjectProject.findById(req.params.id);

    if (!itemToUpdate) {
      return res.status(404).json({ error: "Not found" });
    }
    
    // Ensure the item belongs to the user
    if (itemToUpdate.userId.toString() !== req.user.userId) {
      return res.status(403).json({ error: "Not authorized to update this item" });
    }

    const updatedItem = await SubjectProject.findByIdAndUpdate(
      req.params.id,
      { $set: { ...req.body, dueDate: req.body.dueDate ? req.body.dueDate : undefined } },
      { new: true }
    );
    res.json(updatedItem);
  } catch (err) {
    console.error("UPDATE ERROR:", err);
    res.status(500).json({ error: err.message || "Failed to update subject/project" });
  }
});

// DELETE a subject/project
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const itemToDelete = await SubjectProject.findById(req.params.id);
    
    if (!itemToDelete) {
      return res.status(404).json({ error: "Not found" });
    }

    // Ensure the item belongs to the user
    if (itemToDelete.userId.toString() !== req.user.userId) {
      return res.status(403).json({ error: "Not authorized to delete this item" });
    }

    await SubjectProject.findByIdAndDelete(req.params.id);
  

    res.json({ message: "Item deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete subject/project" });
  }
});

module.exports = router;
