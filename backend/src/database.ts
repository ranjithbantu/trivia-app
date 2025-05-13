import mongoose from 'mongoose';
import dotenv    from 'dotenv';

dotenv.config();

const URI = process.env.MONGO_URL ?? 'mongodb://localhost:27017/trivia';

export async function connectDB(): Promise<void> {
  await mongoose.connect(URI);
  console.log('📦  Mongo connected');
}