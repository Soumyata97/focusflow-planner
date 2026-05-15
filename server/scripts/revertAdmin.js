 * Reverts the specified email from admin back to regular user.
 */

require("dotenv").config({ path: require("path").join(__dirname, "../.env") });
const mongoose = require("mongoose");
const User = require("../models/User");

// The account to revert back to regular user
const REVERT_EMAIL = "soumytashakya80@gmail.com";

const run = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/focusflow");
    console.log("Connected to MongoDB...");

    const result = await User.updateOne(
      { email: REVERT_EMAIL },
      { $set: { roleType: "user" } }
    );

    if (result.modifiedCount > 0) {
      console.log(`Reverted ${REVERT_EMAIL} back to roleType: "user" successfully.`);
    } else {
      console.log(`No change made. User may already be a regular user or not found.`);
    }

    const user = await User.findOne({ email: REVERT_EMAIL }).select("fullName email roleType role");
    if (user) {
      console.log(`\nConfirmation: ${user.fullName} | role: ${user.role} | roleType: ${user.roleType}`);
    }

  } catch (error) {
    console.error("Error:", error.message);
  } finally {
    await mongoose.disconnect();
    console.log("Done.");
  }
};

run();
