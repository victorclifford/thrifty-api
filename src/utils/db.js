import mongoose from "mongoose";
import config from "./config.js";

export const connectDB = async () => {
  try {
    const db = await mongoose.connect(config.DB_URI);
    console.log(`db connected to :: ${db.connection.host}`);
    return db;
  } catch (error) {
    console.log("db connection err::", error);
    process.exit(0);
  }
};
