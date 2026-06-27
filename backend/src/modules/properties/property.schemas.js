import { z } from 'zod';

const propertyType = z.enum(['apartment', 'villa', 'plot', 'independent-house', 'studio', 'commercial']);
const listingType = z.enum(['sale', 'rent']);

const propertyBody = z.object({
  title: z.string().trim().min(8).max(180),
  description: z.string().trim().min(20).max(5000),
  city: z.string().trim().min(2).max(80),
  location: z.string().trim().min(2).max(160),
  address: z.string().trim().max(500).optional().or(z.literal('')),
  propertyType,
  listingType: listingType.default('sale'),
  price: z.coerce.number().nonnegative(),
  bedrooms: z.coerce.number().int().min(0).max(20),
  bathrooms: z.coerce.number().int().min(0).max(20),
  areaSqft: z.coerce.number().int().positive().max(1000000),
  imageUrls: z.array(z.string().url()).max(12).default([]),
  amenities: z.array(z.string().trim().min(1).max(60)).max(30).default([])
});

export const createPropertySchema = z.object({
  body: propertyBody,
  query: z.object({}).passthrough(),
  params: z.object({})
});

export const updatePropertySchema = z.object({
  body: propertyBody.partial().refine((value) => Object.keys(value).length > 0, 'At least one field is required'),
  query: z.object({}).passthrough(),
  params: z.object({ id: z.coerce.number().int().positive() })
});

export const propertyIdSchema = z.object({
  body: z.object({}).passthrough(),
  query: z.object({}).passthrough(),
  params: z.object({ id: z.coerce.number().int().positive() })
});

export const searchPropertiesSchema = z.object({
  body: z.object({}).passthrough(),
  params: z.object({}),
  query: z.object({
    q: z.string().trim().max(120).optional(),
    city: z.string().trim().max(80).optional(),
    location: z.string().trim().max(160).optional(),
    propertyType: propertyType.optional(),
    bedrooms: z.coerce.number().int().min(0).max(20).optional(),
    minBudget: z.coerce.number().nonnegative().optional(),
    maxBudget: z.coerce.number().nonnegative().optional(),
    sort: z.enum(['newest', 'price_asc', 'price_desc', 'area_desc']).default('newest'),
    limit: z.coerce.number().int().min(1).max(50).default(12),
    cursor: z.string().optional()
  })
});
