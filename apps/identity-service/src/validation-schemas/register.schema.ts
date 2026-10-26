
import { z } from 'zod';

export const registerSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, 'Full name must contain at least 2 characters.')
    .max(120, 'Full name must not exceed 120 characters.'),

  email: z
    .string()
    .trim()
    .email('Please provide a valid email address.')
    .max(254, 'Email must not exceed 254 characters.')
    .transform((value) => value.toLowerCase()),

  password: z
    .string()
    .min(12, 'Password must contain at least 12 characters.')
    .max(128, 'Password must not exceed 128 characters.'),
});

export type RegisterInput = z.infer<typeof registerSchema>;
