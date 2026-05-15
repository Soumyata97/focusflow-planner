const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    subject: {
      type: String,
      default: "General",
    },
    subjectProjectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SubjectProject",
    },
    priority: {
      type: String,
      enum: ["Low", "Medium", "High"],
      default: "Medium",
    },
    dueDate: {
      type: Date,
    },
    status: {
      type: String,
      enum: ["pending", "completed"],
      default: "pending",
    },
    completedAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Task", taskSchema);