import Redis from 'redis';
import Redlock from 'redlock';

// Initialize Redis clients
// const redisClients = [
//     new Redis({ port: 6379, host: 'localhost' }),  // Add more instances if needed
// ];
import { RedisPool } from './src/config/redis';

// Initialize Redlock
const redisClients = await Promise.all([RedisPool.acquire()]);
const redlock = new Redlock(
  redisClients as unknown as Redlock.CompatibleRedisClient[]
);

async function acquireLock(resource: string, ttl: number) {
  const lock = await redlock.lock(resource, ttl);
  console.log(`Lock acquired for resource: ${resource}`);
  return lock;
}

async function releaseLock(lock: Redlock.Lock) {
  await redlock.unlock(lock);
  console.log(`Lock released`);
}

// Example usage
async function main() {
  const resource = 'resource:key';
  const ttl = 10000; // Lock expiry time (in milliseconds)

  try {
    const lock = await acquireLock(resource, ttl);
    // Critical section - perform operations that require the lock
    console.log('Executing critical section...');
    await new Promise((resolve) => setTimeout(resolve, 5000)); // Simulating work
    console.log('Critical section completed');
    await releaseLock(lock);
  } catch (error) {
    console.error('Error:', error);
  }
}

main();
