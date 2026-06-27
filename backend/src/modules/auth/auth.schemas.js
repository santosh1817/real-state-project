import { z } from 'zod';

export const registerSchema = z.object({
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
  body: z.object({
    email: z.string().trim().email(),
    password: z.string().min(1)
  }),
  query: z.object({}).passthrough(),
  params: z.object({})
});

export const refreshSchema = z.object({
  body: z.object({
    refreshToken: z.string().min(20)
  }),
  query: z.object({}).passthrough(),
  params: z.object({})
});
