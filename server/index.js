const express = require("express");
require("dotenv").config();
const mongoose = require("mongoose");
const userRoutes = require("./routes/userRoutes");
const cors = require("cors");
const path = require("path");
const fs = require("fs");

const app = express();

// Middleware part

app.use(cors());
app.use(express.json());
// Ensure uploads directory exists
const uploadDir = path.join(__dirname, "uploads/avatars");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Routes part

const authRoutes = require("./routes/authRoutes");
const protectedRoutes = require("./routes/protectedRoutes");
const taskRoutes = require("./routes/taskRoutes");
const subjectProjectRoutes = require("./routes/subjectProjectRoutes");
const timelineRoutes = require("./routes/timelineRoutes");
const pomodoroRoutes = require("./routes/pomodoroRoutes");
const statsRoutes = require("./routes/statsRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const routineRoutes = require("./routes/routineRoutes");
const analyticsRoutes = require("./routes/analyticsRoutes");
const adminRoutes = require("./routes/adminRoutes");
const { initCronJobs } = require("./utils/cronService");


app.use("/api/auth", authRoutes);
app.use("/api", protectedRoutes);
app.use("/api/users", userRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/subject-projects", subjectProjectRoutes);
app.use("/api/timeline", timelineRoutes);
app.use("/api/pomodoro", pomodoroRoutes);
app.use("/api/stats", statsRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/routines", routineRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/admin", adminRoutes);


// MongoDB connection part

mongoose
  .connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/focusflow")
  .then(() => {
    console.log("MongoDB connected successfully!");
    
    // Initialize background cron jobs
    initCronJobs();
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err.message);
  });

// Test route part

app.get("/", (req, res) => {
  res.send("FocusFlow backend running");
});

// Start server part

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
