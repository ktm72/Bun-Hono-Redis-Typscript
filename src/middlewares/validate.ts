import { ZodSchema } from 'zod';
import { type Context, type Next } from 'hono';
import { errorHandler } from './errorMiddleware';

export const validate =
  (schema: ZodSchema) => async (c: Context, next: Next) => {
    try {
      const data = await c.req.json();
      const result = schema.safeParse(data);

      if (!result.success) {
        // Format Zod errors nicely
        const errors = result.error.format();
        return c.json(
          {
            success: false,
            error: errors._errors[0]
          },
          400
        );
      }

      // Store validated data in context for downstream handlers
      c.set('validatedData', result.data);
      await next();
    } catch (error) {
      return errorHandler(error, c, 400);
    }
  };
