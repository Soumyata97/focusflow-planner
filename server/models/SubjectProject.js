const mongoose = require("mongoose");

const subjectProjectSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
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
    color: {
      type: String,
      default: "#6366f1", 
    },
    tags: {
      type: [String],
      default: [],
    },
    status: {
      type: String,
      enum: ["active", "completed"],
      default: "active",
    },
    dueDate: {
      type: Date,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("SubjectProject", subjectProjectSchema);
