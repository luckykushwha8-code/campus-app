import mongoose from "mongoose";

let isConnected = false;

export async function connectDB(uri?: string) {
  if (isConnected && mongoose.connection.readyState === 1) {
    return mongoose.connection.asPromise?.() ?? undefined;
  }
  const connectionString = uri ?? process.env.MONGO_URI ?? "mongodb://localhost:27017/campusdb";
  await mongoose.connect(connectionString, {
    maxPoolSize: 10,
  }).then(() => {
    isConnected = true;
    console.log("[MDB] Connected to MongoDB");
  }).catch((err) => {
    console.error("[MDB] Failed to connect to MongoDB:", err);
    throw err;
  });
}

export default connectDB;
