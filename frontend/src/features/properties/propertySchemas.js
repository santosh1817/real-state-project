import { z } from 'zod';

export const propertySchema = z.object({
  title: z.string().min(8, 'Use at least 8 characters'),
  description: z.string().min(20, 'Use at least 20 characters'),
  city: z.string().min(2, 'City is required'),
  location: z.string().min(2, 'Location is required'),
  address: z.string().optional(),
  propertyType: z.enum(['apartment', 'villa', 'plot', 'independent-house', 'studio', 'commercial']),
  listingType: z.enum(['sale', 'rent']),
  price: z.coerce.number().nonnegative(),
  bedrooms: z.coerce.number().int().min(0),
  bathrooms: z.coerce.number().int().min(0),
  areaSqft: z.coerce.number().int().positive(),
  imageUrls: z.string().optional(),
  amenities: z.string().optional()
});

export function normalizeProperty(values) {
  return {
    ...values,
    imageUrls: values.imageUrls ? values.imageUrls.split(',').map((item) => item.trim()).filter(Boolean) : [],
    amenities: values.amenities ? values.amenities.split(',').map((item) => item.trim()).filter(Boolean) : []
  };
}
