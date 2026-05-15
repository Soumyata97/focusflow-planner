/*One-time migration script*/

require("dotenv").config({ path: require("path").join(__dirname, "../.env") });
const mongoose = require("mongoose");
const User = require("../models/User");

const run = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/focusflow");
    console.log("Connected to MongoDB...");

    // Backfill missing fields on all existing users
    const result = await User.updateMany(
      {
        $or: [
          { roleType: { $exists: false } },
          { lastLogin: { $exists: false } },
          { loginCount: { $exists: false } },
          { isActive: { $exists: false } },
        ],
      },
      {
        $set: {
          roleType: "user",
          lastLogin: null,
          loginCount: 0,
          isActive: false,
        },
      }
    );

    console.log(`Migration complete. ${result.modifiedCount} user(s) updated.`);

    // List all users now for confirmation
    const users = await User.find({}).select("fullName email roleType isActive loginCount");
    console.log("\nAll users after migration:");
    users.forEach((u) => {
      console.log(`  - ${u.fullName} (${u.email}) | roleType: ${u.roleType} | loginCount: ${u.loginCount}`);
    });

  } catch (error) {
    console.error("Migration failed:", error.message);
  } finally {
    await mongoose.disconnect();
    console.log("\nDisconnected. Done.");
  }
};

run();
