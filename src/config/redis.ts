import { createClient, type RedisClientType } from 'redis';

export type ClientType = RedisClientType | null;
let redisClient: ClientType = null;

// Connection configuration
interface RedisConfig {
  username?: string;
  password?: string;
  socket: {
    host: string;
    port: number;
    tls?: boolean;
    reconnectStrategy?: (retries: number) => number | Error;
  };
}

// factory function
const getRedisConfig = (): RedisConfig => ({
  username: process.env.REDIS_USERNAME,
  password: process.env.REDIS_PASSWORD,
  socket: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
    reconnectStrategy: (retries: number) => {
      if (retries > 5) {
        console.error('Max reconnection attempts reached');
        return new Error('Max reconnections reached');
      }
      return Math.min(retries * 100, 5000);
    }
  }
});

const createRedisClient = (): RedisClientType => {
  const client = createClient(getRedisConfig()) as RedisClientType;

  client.on('error', (err: Error) => {
    console.error('Redis client error', {
      error: err.message,
      stack: err.stack
    });

    closeRedisClient(client);
  });

  client.on('connect', () => {
    console.log('Redis client connected');
  });

  client.on('reconnecting', () => {
    console.log('Redis client reconnecting');
  });

  client.on('end', () => {
    console.log('Redis client connection closed');
  });

  return client;
};

export const getRedisClient = async (): Promise<RedisClientType> => {
  if (!redisClient) {
    redisClient = createRedisClient();
    try {
      await redisClient.connect();
    } catch (err) {
      redisClient = null;
      throw err;
    }
  }

  return redisClient;
};

export const closeRedisClient = async (client: ClientType): Promise<void> => {
  if (client !== null) {
    try {
      await client.disconnect();
      console.log('Redis client disconnected gracefully');
    } catch (err) {
      client = null;
      console.log('Error while disconnecting Redis client', { error: err });
    } finally {
      redisClient = null;
    }
  }
};

// Graceful shutdown handler
process.on('SIGTERM', async () => {
  await closeRedisClient(redisClient);
  process.exit(0);
});

process.on('SIGINT', async () => {
  await closeRedisClient(redisClient);
  process.exit(0);
});
