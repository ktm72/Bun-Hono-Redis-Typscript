// src/utils/error-handler.ts
import { type Context, type Next } from 'hono';
import type { ContentfulStatusCode } from 'hono/utils/http-status';

type ErrorWithName = Error & {
  name: string;
  errors?: Record<string, { path: string; message: string }>;
};

export class NotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'NotFoundError';
  }
}

export async function errorHandler(
  error: unknown,
  c: Context,
  defaultCode: number = 500
) {
  let status = defaultCode;
  let message = 'Internal server error';
  let details = null;

  if (error instanceof Error) {
    const err = error as ErrorWithName;
    message = err.message;

    if (err.name === 'ValidationError') {
      status = 422;
      message = 'Validation failed';
      if (err.errors) {
        details = Object.values(err.errors).map((e) => ({
          field: e.path,
          message: e.message
        }));
      }
    } else if (err.name === 'MongoServerError') {
      status = 409;
    } else if (err.name === 'NotFoundError') {
      status = 404;
    }
    // Add more error types as needed
  }

  return c.json(
    { error: message, success: false, ...(details && { details }) },
    status as ContentfulStatusCode
  );
}

// Higher order function
export function withErrorHandling(
  controllerFn: (c: Context) => Promise<Response>,
  defaultErrorCode: number = 500
) {
  return async (c: Context) => {
    try {
      return await controllerFn(c);
    } catch (error) {
      return errorHandler(error, c, defaultErrorCode);
    }
  };
}

export function globalErrorMiddleware() {
  return async (c: Context, next: Next) => {
    try {
      await next(); // Pass control to the next middleware/route
    } catch (error) {
      return errorHandler(error, c);
    }
  };
}
