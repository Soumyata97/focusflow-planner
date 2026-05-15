require("dotenv").config({ path: require("path").join(__dirname, "../.env") });
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("../models/User");

const ADMIN_EMAIL = "focusflow.admin@gmail.com";
const NEW_PASSWORD = "Focusflow123!";

const run = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/focusflow");
    console.log("Connected to MongoDB...");

    // Find the admin user
    const user = await User.findOne({ email: ADMIN_EMAIL, roleType: "admin" });
    if (!user) {
      console.log(`No admin user found with email: ${ADMIN_EMAIL}`);
      return;
    }

    // Hash the new password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(NEW_PASSWORD, salt);
    await user.save();

    console.log(`Password for ${ADMIN_EMAIL} has been successfully reset to: ${NEW_PASSWORD}`);

  } catch (error) {
    console.error("Error:", error.message);
  } finally {
    await mongoose.disconnect();
    console.log("Done.");
  }
};

run();
