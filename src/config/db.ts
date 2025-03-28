import mongoose from 'mongoose';
import cron from 'node-cron';
import { Db } from 'mongodb';
import formatSize from '../utils/byteConvertion';

export async function initializeDatabase() {
  try {
    const conn = await mongoose.connect(process.env.DATABASE_URL!);
    console.log('Connected to MongoDB with Mongoose');
  } catch (error) {
    console.error('Database connection error:', error);
    process.exit(1);
  }
}

export async function disconnectDatabase() {
  await mongoose.disconnect();
}

cron.schedule('*/10 0 * * *', async () => {
  // Runs at midnight every day
  const db = mongoose.connection.db as Db;
  const stats = await db.stats();

  // Convert bytes to KB (1 KB = 1024 bytes)
  const storageSizeKB = formatSize(stats.storageSize);
  const totalSizeKB = formatSize(stats.fsTotalSize);
  const usedPercentage = (stats.storageSize / stats.fsTotalSize) * 100;

  console.log(`
    📊 Database Storage Report:
    ---------------------------------
    ✅ Storage Used: ${storageSizeKB}
    💾 Total Space: ${totalSizeKB}
    📈 Usage: ${usedPercentage.toFixed(2)}%
    ---------------------------------
    ${
      usedPercentage > 80
        ? '🚨 Warning: Storage exceeds 80%!'
        : '🟢 Storage within safe limits'
    }
  `);
});
