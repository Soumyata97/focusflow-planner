const mongoose = require("mongoose");

const routineSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: "",
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      enum: ["student", "professional"],
      required: true,
    },
    category: {
      type: String,
      enum: ["morning", "afternoon", "evening", "night"],
      required: true,
    },
    startTime: {
      type: String,
      required: true, // e.g. "06:30"
    },
    endTime: {
      type: String,
      default: "",
    },
    frequency: {
      type: [String],
      required: true, // e.g. ["Mon", "Wed", "Fri"] or ["Daily"]
    },
    isActive: {
      type: Boolean,
      default: false,
    },
    streakCount: {
      type: Number,
      default: 0,
    },
    completionRate: {
      type: Number,
      default: 0,
    },
    completedDays: {
      type: [String], // Array of "YYYY-MM-DD"
      default: [],
    },
    iconName: {
      type: String,
      default: "FaRegCircle",
    },
    color: {
      type: String,
      default: "#6c5ce7",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Routine", routineSchema);
