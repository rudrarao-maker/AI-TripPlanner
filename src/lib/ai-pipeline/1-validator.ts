import { z } from "zod";
import { PipelineState } from "./types";

export const TripInputSchema = z.object({
  origin: z.string().min(1, "Origin is required"),
  destination: z.string().min(1, "Destination is required"),
  destinations: z.array(z.string()).optional(),
  startDate: z.string().transform((str) => str.slice(0, 10)).refine((str) => /^\d{4}-\d{2}-\d{2}$/.test(str), "Invalid date format"),
  endDate: z.string().transform((str) => str.slice(0, 10)).refine((str) => /^\d{4}-\d{2}-\d{2}$/.test(str), "Invalid date format"),
  travelers: z.coerce.number().min(1).default(1),
  budget: z.coerce.number().min(1),
  budgetTier: z.enum(["cheap", "moderate", "luxury", "compare"]).optional(),
  currency: z.string().default("INR"),
  travelStyle: z.string().default("Balanced"),
  transportPreference: z.string().default("Mixed"),
  hotelCategory: z.string().default("3-star"),
  foodPreference: z.string().default("Any"),
  pace: z.string().default("balanced"),
  interests: z.array(z.string()).optional(),
  dietary: z.array(z.string()).optional(),
  accessibility: z.array(z.string()).optional(),
  additionalNotes: z.string().optional(),
  userProfileWeights: z.record(z.number()).optional(),
});

export class TripInputValidator {
  static validate(input: any): PipelineState {
    const parsed = TripInputSchema.parse(input);
    
    // Basic date validation
    const start = new Date(parsed.startDate);
    const end = new Date(parsed.endDate);
    if (end < start) {
      throw new Error("End date cannot be before start date");
    }

    return {
      preferences: parsed,
      context: {},
      discoveredPlaces: [],
      rankedPlaces: [],
      warnings: [],
    };
  }
}
