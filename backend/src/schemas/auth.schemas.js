import { z } from 'zod';

export const registerSchema = z.object({
  // Registration requires basic identity and a strong-enough password.
  body: z.object({
    name: z.string().trim().min(2).max(120),
    email: z.string().trim().email().max(160),
    password: z.string().min(8).max(100),
    phone: z.string().trim().min(7).max(30).optional().or(z.literal(''))
  }),
  query: z.object({}).passthrough(),
  params: z.object({})
});

export const loginSchema = z.object({
  // Login only needs email and password.
  body: z.object({
    email: z.string().trim().email(),
    password: z.string().min(1)
  }),
  query: z.object({}).passthrough(),
  params: z.object({})
});

export const refreshSchema = z.object({
  // Refresh token is sent in body to get a new access/refresh pair.
  body: z.object({
    refreshToken: z.string().min(20)
  }),
  query: z.object({}).passthrough(),
  params: z.object({})
});
