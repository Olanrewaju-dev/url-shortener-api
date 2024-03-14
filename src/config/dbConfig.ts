import mongoose from "mongoose";
require("dotenv").config();

const MONGODB_URI = process.env.MONGODB_URI;

// connect to mongodb
function connectToMongoDB() {
  mongoose.connect(MONGODB_URI || "", {
    dbName: process.env.DB_NAME,
  });

  mongoose.connection.on("connected", () => {
    console.log("Connected to MongoDB successfully");
  });

  mongoose.connection.on("error", (err) => {
    console.log("Error connecting to MongoDB", err);
    process.exit(1);
  });
}

export default { connectToMongoDB };
