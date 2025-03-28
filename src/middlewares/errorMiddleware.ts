import { type Context } from 'hono';
import type { ContentfulStatusCode } from 'hono/utils/http-status';

type ErrorWithName = Error & {
  name: string;
  errors?: Record<string, { path: string; message: string }>;
};

export async function errorHandler(
  error: unknown,
  c: Context,
  code: number = 500
) {
  let status = code;
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
    }
  }

  return c.json(
    { error: message, ...(details && { details }) },
    status as ContentfulStatusCode
  );
}
