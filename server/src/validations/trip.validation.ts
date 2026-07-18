import { z } from 'zod';

export const createTripSchema = z.object({
  body: z.object({
    origin: z.string().min(2, 'Origin is required'),
    destination: z.string().min(2, 'Destination is required'),
    startDate: z.string().datetime({ message: 'Invalid start date' }),
    endDate: z.string().datetime({ message: 'Invalid end date' }),
    travelers: z.number().min(1).default(1),
    budget: z.number().min(1, 'Budget must be greater than 0'),
    currency: z.string().default('INR'),
    travelStyle: z.string(),
    transportPreference: z.string(),
    hotelCategory: z.string(),
    foodPreference: z.string(),
  }),
});

export const updateTripSchema = z.object({
  body: z.object({
    title: z.string().optional(),
    status: z.string().optional(),
    coverImage: z.string().optional(),
  }),
});

