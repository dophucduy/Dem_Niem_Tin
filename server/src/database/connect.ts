import mongoose from "mongoose";

export async function connectDatabase(uri: string): Promise<boolean> {
  try {
    await mongoose.connect(uri);
    console.log("MongoDB connected");
    return true;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown database error";
    console.warn(`MongoDB unavailable: ${message}`);
    return false;
  }
}
