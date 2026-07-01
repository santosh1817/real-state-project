import { z } from 'zod';

export const createInquirySchema = z.object({
  // Inquiry message is required; phone is optional.
  body: z.object({
    message: z.string().trim().min(10).max(1000),
    phone: z.string().trim().min(7).max(30).optional().or(z.literal(''))
  }),
  query: z.object({}).passthrough(),
  params: z.object({ propertyId: z.coerce.number().int().positive() })
});
