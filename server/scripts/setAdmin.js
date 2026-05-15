/*
 * Sets a specific user as admin by email.
 */

require("dotenv").config({ path: require("path").join(__dirname, "../.env") });
const mongoose = require("mongoose");
const User = require("../models/User");

//  Change this to your email
const ADMIN_EMAIL = "focusflow.admin@gmail.com";

const run = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/focusflow");
    console.log("Connected to MongoDB...");

    const result = await User.updateOne(
      { email: ADMIN_EMAIL },
      { $set: { roleType: "admin" } }
    );

    if (result.matchedCount === 0) {
      console.log(`No user found with email: ${ADMIN_EMAIL}`);
    } else if (result.modifiedCount === 0) {
      console.log(`User ${ADMIN_EMAIL} is already an admin.`);
    } else {
      console.log(`Successfully set ${ADMIN_EMAIL} as ADMIN.`);
    }

    // Confirm
    const user = await User.findOne({ email: ADMIN_EMAIL }).select("fullName email roleType");
    if (user) {
      console.log(`\nConfirmation: ${user.fullName} | roleType: ${user.roleType}`);
    }

  } catch (error) {
    console.error("Error:", error.message);
  } finally {
    await mongoose.disconnect();
    console.log("Done.");
  }
};

run();
