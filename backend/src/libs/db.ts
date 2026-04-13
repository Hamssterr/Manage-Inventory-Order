import mongoose from "mongoose";

export const connectDB = async (): Promise<void> => {
  try {
    const connect = await mongoose.connect(process.env.MONGODB as string);
    console.log(`MongoDB Connected: ${connect.connection.host}`);
  } catch (error: any) {
    console.log(`Error connecting to MongoDB: ${error.message}`);
    process.exit(1);
  }
};
