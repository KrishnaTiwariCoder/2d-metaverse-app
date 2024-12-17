import mongoose from "mongoose";

const connectionString = process.env.CONNECTION_STRING;

export const connectToDB = () =>
  mongoose
    .connect(connectionString)
    .then(() => console.log("Connected to MongoDB"))
    .catch((err) => console.error("MongoDB connection error:", err));
