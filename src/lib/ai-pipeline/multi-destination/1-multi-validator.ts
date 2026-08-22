import { z } from "zod";
import { DestinationEntrySchema, MultiDestPipelineState } from "../types";

const MultiDestInputSchema = z.object({
  origin: z.string().min(1),
  startDate: z.string().transform((str) => str.slice(0, 10)),
  endDate: z.string().transform((str) => str.slice(0, 10)),
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
  destinationEntries: z.array(DestinationEntrySchema).min(2).max(10),
});

export class MultiDestValidator {
  static validate(input: any): MultiDestPipelineState {
    const parsed = MultiDestInputSchema.parse(input);

    // Validate date range
    const start = new Date(parsed.startDate);
    const end = new Date(parsed.endDate);
    if (end < start) {
      throw new Error("End date cannot be before start date");
    }

    // Calculate total requested days
    const totalRequestedDays = parsed.destinationEntries.reduce(
      (sum, d) => sum + d.numberOfDays, 0
    );
    const tripDurationDays = Math.ceil(
      (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
    );

    const warnings: string[] = [];

    if (totalRequestedDays > tripDurationDays) {
      warnings.push(
        `Requested ${totalRequestedDays} days across destinations but trip is only ${tripDurationDays} days. Dates may be adjusted.`
      );
    }

    // Check for duplicate destinations
    const names = parsed.destinationEntries.map(d => d.name.toLowerCase());
    const dupes = names.filter((name, i) => names.indexOf(name) !== i);
    if (dupes.length > 0) {
      warnings.push(`Duplicate destinations detected: ${[...new Set(dupes)].join(", ")}. This is allowed but unusual.`);
    }

    // Sort by order
    const sorted = [...parsed.destinationEntries].sort((a, b) => a.order - b.order);

    return {
      isMultiDestination: true,
      preferences: {
        origin: parsed.origin,
        destination: sorted[0].name, // Primary destination
        startDate: parsed.startDate,
        endDate: parsed.endDate,
        travelers: parsed.travelers,
        budget: parsed.budget,
        budgetTier: parsed.budgetTier,
        currency: parsed.currency,
        travelStyle: parsed.travelStyle,
        transportPreference: parsed.transportPreference,
        hotelCategory: parsed.hotelCategory,
        foodPreference: parsed.foodPreference,
        pace: parsed.pace,
        interests: parsed.interests,
        dietary: parsed.dietary,
        accessibility: parsed.accessibility,
      },
      destinationEntries: sorted,
      transfers: [],
      perDestinationContext: {},
      perDestinationPlaces: {},
      perDestinationRanked: {},
      warnings,
    };
  }
}
