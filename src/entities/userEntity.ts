import { z } from 'zod';

// Base schema with all fields
const UserBaseSchema = z.object({
  username: z.string().min(3),
  email: z.string().email(),
  password: z.string().min(6),
  firstName: z.string().optional(),
  lastName: z.string().optional()
});

// Schema for creation (without generated fields)
export const UserCreateSchema = UserBaseSchema;

// Schema for response/output (with all fields)
export const UserResponseSchema = UserBaseSchema.extend({
  id: z.string(),
  createdAt: z.date(),
  updatedAt: z.date()
});

// Type definitions
export type User = z.infer<typeof UserCreateSchema>;
export type UserResponse = z.infer<typeof UserResponseSchema>;
