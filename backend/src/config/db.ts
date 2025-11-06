import mongoose from "mongoose";

const connectDB = async (): Promise<void> => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI as string, {
      serverSelectionTimeoutMS: 30000,
    });
    console.log(`MongoDB Connected ${conn.connection.host}`);
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error(`Error message: ${error.message}`);
    } else {
      console.error(`Unknown error occurred: ${error}`);
    }
    process.exit(1);
  }
};
export default connectDB;