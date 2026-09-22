import mongoose from "mongoose";

export async function connectDatabase(uri: string, databaseName: string): Promise<boolean> {
  try {
    await mongoose.connect(uri, { dbName: databaseName });
    console.log(`MongoDB connected: ${databaseName}`);
    return true;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown database error";
    console.warn(`MongoDB unavailable: ${message}`);
    return false;
  }
}
