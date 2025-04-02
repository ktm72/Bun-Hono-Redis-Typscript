import { createClient, type RedisClientType } from 'redis';
import { createPool } from 'generic-pool';

export type ClientType = RedisClientType | null;

// Define a proper type for your Redis client
export type RedisClient = RedisClientType<any, any, any>;
let redisClient: RedisClient;

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

// Update your pool creation to use the proper type
const RedisConfig = {
  create: async () => {
    const client = createClient(getRedisConfig());
    await client.connect();
    redisClient = client;
    return client;
  },
  destroy: async (client: RedisClient) => {
    await client.disconnect().catch((err: Error) =>
      console.error('Redis client error', {
        error: err.message,
        stack: err.stack
      })
    );
  }
};

const pool = createPool(RedisConfig, {
  min: 1,
  max: 5, // Adjust based on your expected load
  acquireTimeoutMillis: 5000,
  idleTimeoutMillis: 30000
});

interface RedisPool {
  acquire: () => Promise<RedisClient>;
  release: (client: RedisClient) => Promise<void>;
}

export const RedisPool = {
  acquire: () => pool.acquire(),
  release: (client: RedisClient) => pool.release(client)
} satisfies RedisPool;

// const createRedisClient = (): RedisClientType => {
//   const client = createClient(getRedisConfig()) as RedisClientType;

//   client.on('error', (err: Error) => {
//     console.error('Redis client error', {
//       error: err.message,
//       stack: err.stack
//     });

//     closeRedisClient(client);
//   });

//   client.on('connect', () => {
//     console.log('Redis client connected');
//   });

//   client.on('reconnecting', () => {
//     console.log('Redis client reconnecting');
//   });

//   client.on('end', () => {
//     console.log('Redis client connection closed');
//   });

//   return client;
// };

// export const getRedisClient = async (): Promise<RedisClientType> => {
//   if (!redisClient) {
//     redisClient = createRedisClient();
//     try {
//       await redisClient.connect();
//     } catch (err) {
//       redisClient = null;
//       throw err;
//     }
//   }

//   return redisClient;
// };

// export const closeRedisClient = async (client: ClientType): Promise<void> => {
//   if (client !== null) {
//     try {
//       await client.disconnect();
//       console.log('Redis client disconnected gracefully');
//     } catch (err) {
//       client = null;
//       console.log('Error while disconnecting Redis client', { error: err });
//     } finally {
//       redisClient = null;
//     }
//   }
// };

// Graceful shutdown handler
const kill = async (code = 0) => {
  if (redisClient) await RedisPool.release(redisClient);
  console.log('Redis client disconnected gracefully');
  // await closeRedisClient(redisClient);
  process.exit(code);
};

process.on('SIGTERM', kill);
process.on('SIGINT', kill);
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  kill();
});
