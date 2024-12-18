import mongoose from "mongoose";
import { MONGODB_URL } from "../constants/env";

const connectDB = async () => {
  try {
    if (mongoose.connection.readyState >= 1) return;
    const { connection } = await mongoose.connect(MONGODB_URL);
    if (connection) {
      console.log(`Successfully connected to DB: ${connection.name}`);
    }
  } catch (error: any) {
    console.error(`Error connecting to DB: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;
