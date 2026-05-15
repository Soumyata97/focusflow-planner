const mongoose = require("mongoose");

const timelineEntrySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    // Optional: if linked to an existing task from TasksPage
    taskId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Task",
    },
    // Optional: if linked to a subject/project
    subjectProjectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SubjectProject",
    },
    title: {
      type: String,
      required: true,
    },
    date: {
      type: String, // Format: YYYY-MM-DD
      required: true,
    },
    startTime: {
      type: String, // Format: HH:MM
      required: true,
    },
    endTime: {
      type: String, // Format: HH:MM
      required: true,
    },
    duration: {
      type: Number, // in minutes
      required: true,
    },
    color: {
      type: String,
      default: "#6c5ce7",
    },
    type: {
      type: String,
      enum: ["student", "professional"],
      required: true,
    },
    status: {
      type: String,
      enum: ["scheduled", "completed", "missed"],
      default: "scheduled",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("TimelineEntry", timelineEntrySchema);
