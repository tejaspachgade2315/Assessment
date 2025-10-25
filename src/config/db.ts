import dotenv from "dotenv";
import mongoose from "mongoose";

dotenv.config();

const connect = () => {
  const MONGODB_URI = process.env.MONGODB_URI as string;
  console.log(MONGODB_URI);
  try {
    mongoose.connect(MONGODB_URI!);
    const connection = mongoose.connection;
    connection.on("connected", () => {
      console.log("MongoDB connected successfully");
    });
    connection.on("error", (err) => {
      console.log("MongoDB connection error", err);
    });
  } catch (error) {
    console.log(error);
  }
};

export default connect;
