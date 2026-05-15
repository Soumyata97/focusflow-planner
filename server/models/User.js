const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
    },

    // Optional for Google OAuth users
    password: {
      type: String,
      required: false,
    },

    // Google OAuth fields
    googleId: {
      type: String,
      default: null,
    },
    authProvider: {
      type: String,
      enum: ["local", "google"],
      default: "local",
    },
    profileImage: {
      type: String,
      default: "",
    },

    role: {
      type: String,
      enum: ["student", "professional"],
      default: null, 
    },

    gender: {
      type: String,
      default: ""
    },
    contact: {
      type: String,
      default: ""
    },
    location: {
      type: String,
      default: ""
    },
    nickname: {
      type: String,
      default: ""
    },
    profilePicture: {
      type: String,
      default: ""
    },
    pomodoroSettings: {
      soundEnabled: { type: Boolean, default: false },
      soundType: { type: String, default: "droplet" },
      desktopEnabled: { type: Boolean, default: false }
    },

    // Reset Password OTP fields
    resetPasswordOTP: {
      type: String,
      default: null,
    },
    resetPasswordExpires: {
      type: Date,
      default: null,
    },
    dailyMantra: {
      text: { type: String, default: "" },
      date: { type: Date, default: null }
    },
    planner: {
      topPriorities: {
        type: [String],
        default: ["", "", ""]
      },
      reminders: {
        type: String,
        default: ""
      },
      todoList: [{
        todoId: String,
        text: String,
        completed: { type: Boolean, default: false }
      }],
      lastUpdated: {
        type: Date,
        default: null
      }
    },

    // Admin & Activity Tracking
    roleType: {
      type: String,
      default: "user",
      enum: ["user", "admin"]
    },
    lastLogin: {
      type: Date,
      default: null
    },
    loginCount: {
      type: Number,
      default: 0
    },
    isActive: {
      type: Boolean,
      default: false
    }
  },

  { timestamps: true } 
);

module.exports = mongoose.model("User", userSchema);