import {
  getRedisClient,
  closeRedisClient,
  type ClientType
} from '../config/redis';
import { type RedisClientType } from 'redis';

const DEFAULT_TTL = 3600 * 24; // 24 hour in seconds

// Higher-order function for error handling
const withRedis = async <T>(
  operation: string,
  fn: (client: RedisClientType) => Promise<T>
): Promise<T> => {
  let client: ClientType = null;
  try {
    client = await getRedisClient();
    // console.log(`Redis ${operation} starting`);
    const result = await fn(client);
    // console.log(`Redis ${operation} operation closed`);
    return result;
  } catch (error) {
    console.error(`Redis ${operation} failed:`, {
      error: error instanceof Error ? error.message : 'Unknown error',
      operation,
      timestamp: new Date().toISOString()
    });
    throw error; // Re-throw after logging
  } finally {
    // unlock while distributed processes
    if (client) {
      await closeRedisClient(client);
    }
  }
};

// Cache operations
export const getCache = async <T>(key: string): Promise<T | null> => {
  return withRedis('get', async (client) => {
    const exists = await client.exists(key);
    if (!exists) {
      console.log(`Key ${key} does not exist`);
      return null;
    }
    const data = await client.get(key);
    // console.log(`Cache ${data ? 'hit' : 'miss'} for key: ${key}`);
    return data ? JSON.parse(data) : null;
  });
};

export const setCache = async <T>(
  key: string,
  value: T,
  ttl: number = DEFAULT_TTL
): Promise<void> => {
  return withRedis('set', async (client) => {
    await client.setEx(key, ttl, JSON.stringify(value));
    console.log(`Cache set for key: ${key} with TTL: ${ttl}s`);
  });
};

export const deleteCache = async (key: string): Promise<boolean> => {
  return withRedis('delete', async (client) => {
    const exists = await client.exists(key);
    if (!exists) {
      console.log(`Key ${key} does not exist`);
      return false;
    }
    const result = await client.del(key);
    const success = result > 0;
    console.log(`Cache ${success ? 'deleted' : 'not found'} for key: ${key}`);
    return success;
  });
};

export const flushCache = async (): Promise<void> => {
  return withRedis('flushAll', async (client) => {
    console.warn('Flushing ALL cache data');
    await client.flushAll();
  });
};
