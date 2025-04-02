import { type Context, type Next } from 'hono';
import { errorHandler } from '../utils/error-handler';

export function globalErrorMiddleware() {
  return async (c: Context, next: Next) => {
    try {
      await next(); // Pass control to the next middleware/route
    } catch (error) {
      return errorHandler(error, c);
    }
  };
}
