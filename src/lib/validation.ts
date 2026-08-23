import { z } from "zod";

// ─── Trip Save Validation ────────────────────────────────────────
export const TripSaveSchema = z.object({
  tripData: z.object({
    title: z.string().min(1, "Title is required").max(200, "Title too long"),
    origin: z.string().max(200).optional(),
    destination: z.string().max(200).optional(),
    startDate: z.string().refine((d) => !isNaN(Date.parse(d)), "Invalid start date"),
    endDate: z.string().refine((d) => !isNaN(Date.parse(d)), "Invalid end date"),
    budget: z.number().positive("Budget must be positive").max(100_000_000, "Budget too large"),
    currency: z.string().max(10).optional(),
    days: z.array(z.object({
      dayNumber: z.number().int().positive(),
      date: z.string().optional(),
      activities: z.array(z.object({
        time: z.string().optional(),
        name: z.string().min(1).max(300),
        location: z.string().min(1).max(500),
        description: z.string().max(2000).optional(),
        category: z.string().max(50).optional(),
        estimatedCost: z.number().min(0).default(0),
        currency: z.string().max(10).optional(),
      })).optional(),
    })).min(1, "At least one day required").max(60, "Maximum 60 days"),
  }),
  preferences: z.object({
    origin: z.string().max(200).optional(),
    destination: z.string().max(200).optional(),
    travelStyle: z.string().max(100).optional(),
    transportPreference: z.string().max(100).optional(),
    hotelCategory: z.string().max(100).optional(),
    foodPreference: z.string().max(100).optional(),
  }).optional(),
});

// ─── Trip Generation Validation ──────────────────────────────────
export const TripGenerateSchema = z.object({
  origin: z.string().min(1, "Origin is required").max(200),
  destination: z.string().min(1, "Destination is required").max(200),
  startDate: z.string().refine((d) => !isNaN(Date.parse(d)), "Invalid start date"),
  endDate: z.string().refine((d) => !isNaN(Date.parse(d)), "Invalid end date"),
  budget: z.union([z.number(), z.string()]).transform((v) => Number(v)),
  travelers: z.union([z.number(), z.string()]).transform((v) => Number(v)).optional(),
  travelStyle: z.string().max(100).optional(),
  transportPreference: z.string().max(100).optional(),
  hotelCategory: z.string().max(100).optional(),
  foodPreference: z.string().max(100).optional(),
  budgetTier: z.enum(["cheap", "moderate", "luxury", "compare"]).optional(),
});

// ─── AI Chat Validation ──────────────────────────────────────────
export const AIChatSchema = z.object({
  prompt: z.string().min(1, "Prompt is required").max(5000, "Prompt too long (max 5000 chars)"),
});

// ─── Newsletter Subscription ─────────────────────────────────────
export const NewsletterSchema = z.object({
  email: z.string().email("Invalid email address").max(320),
});

// ─── Admin User Update ───────────────────────────────────────────
export const AdminUserUpdateSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  email: z.string().email().max(320).optional(),
  role: z.enum(["user", "admin", "super_admin"]).optional(),
  status: z.enum(["active", "suspended", "banned"]).optional(),
});

// ─── Booking Creation ────────────────────────────────────────────
export const BookingSchema = z.object({
  tripId: z.string().uuid("Invalid trip ID"),
  type: z.enum(["flight", "hotel", "train", "bus", "car", "other"]),
  provider: z.string().max(200).optional(),
  amount: z.number().positive("Amount must be positive"),
  currency: z.string().max(10).default("INR"),
  referenceId: z.string().max(200).optional(),
});

// ─── Helper: safely parse and return errors ──────────────────────
export function validateInput<T>(schema: z.ZodSchema<T>, data: unknown): { success: true; data: T } | { success: false; errors: string[] } {
  const result = schema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return {
    success: false,
    errors: result.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`),
  };
}
// ─── Activity Update ───────────────────────────────────────────
export const ActivityUpdateSchema = z.object({
  id: z.string().uuid().optional(),
  tripDayId: z.string().uuid(),
  time: z.string().optional(),
  name: z.string().min(1).max(300),
  location: z.string().min(1).max(500),
  description: z.string().max(2000).optional(),
  category: z.string().max(50).optional(),
  estimatedCost: z.union([z.number(), z.string()]).transform((v) => Number(v)).default(0),
  currency: z.string().max(10).optional(),
});

export const TripUpdateSchema = z.object({
  activities: z.array(ActivityUpdateSchema).optional(),
});