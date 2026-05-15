const mongoose = require("mongoose");

const pomodoroSessionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    taskId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Task",
      required: true,
    },
    subjectProjectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SubjectProject",
      required: true,
    },
    type: {
      type: String,
      enum: ["student", "professional"],
      required: true,
    },
    duration: {
      type: Number, // in minutes
      required: true,
    },
    focusMode: {
      type: String,
      enum: ["beginner", "deep", "custom"],
      default: "beginner",
    },
    breakDuration: {
      type: Number, // in minutes
    },
    startTime: {
      type: Date,
      required: true,
    },
    endTime: {
      type: Date,
    },
    status: {
      type: String,
      enum: ["running", "completed", "interrupted"],
      default: "running",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("PomodoroSession", pomodoroSessionSchema);
