import type { Db } from 'mongodb';
import mongoose from 'mongoose';
import formatSize from '../utils/byteConvertion';
import type { Context } from 'hono';

export async function checkDatabaseStorage(c: Context) {
  const db = mongoose.connection.db as Db;
  const stats = await db.stats();
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
  // if (usedPercentage > 80) {
  // Send email/notification here (e.g., Nodemailer, Slack webhook)
  // }

  return c.json(
    {
      used: storageSizeKB,
      TotalSpace: totalSizeKB,
      usage: `${usedPercentage.toFixed(2)} %`,
      process: process.pid
    },
    200
  );
}
