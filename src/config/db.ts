import mongoose from 'mongoose';

export async function initializeDatabase() {
  try {
    await mongoose.connect(process.env.DATABASE_URL!);
    console.log('Connected to MongoDB with Mongoose');
  } catch (error) {
    console.error('Database connection error:', error);
    process.exit(1);
  }
}

export async function disconnectDatabase() {
  await mongoose.disconnect();
}