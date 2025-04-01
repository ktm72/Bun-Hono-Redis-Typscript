import { Hono } from 'hono';
import { logger } from 'hono/logger';
import { cors } from 'hono/cors';
import dotenv from 'dotenv';
import { initializeDatabase, disconnectDatabase } from './config/db';
import userRoutes from './routes/userRoutes';
import storageRoute from './routes/StorageRoute';

const app = new Hono();
// Middleware
dotenv.config();
app.use('*', cors());
app.use('*', logger());

// Routes
app
  .basePath('/api')
  .route('/users', userRoutes)
  .route('/storage', storageRoute);

// Database and Server
async function startServer() {
  await initializeDatabase();

  const port = parseInt(process.env.PORT || '3000');
  const server = Bun.serve({
    port,
    fetch: app.fetch,
    reusePort: true
  });

  console.log(
    `Server running on http://localhost:${server.port} with process - ${process.pid}`
  );
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  disconnectDatabase();
  process.exit(1);
});

// Shutdown hooks
process.on('SIGINT', async () => {
  await disconnectDatabase();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await disconnectDatabase();
  process.exit(0);
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});
