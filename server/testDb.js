require("dotenv").config();
const mongoose = require("mongoose");
const PomodoroSession = require("./models/PomodoroSession");

async function checkDb() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected");
  
  const actualDurationSum = {
    $sum: {
      $cond: {
        if: { $eq: ["$status", "completed"] },
        then: "$duration",
        else: {
          $cond: {
            if: { $and: [ { $ifNull: ["$endTime", false] }, { $ifNull: ["$startTime", false] } ] },
            then: { $round: [{ $divide: [{ $subtract: ["$endTime", "$startTime"] }, 60000] }, 0] },
            else: 0
          }
        }
      }
    }
  };

  const res = await PomodoroSession.aggregate([
    { $match: { type: "professional", status: { $in: ["completed", "interrupted"] } } },
    { $group: { _id: null, total: actualDurationSum } }
  ]);

  console.log("Aggregated total focus time:", res);
  process.exit(0);
}

checkDb();


