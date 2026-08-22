import { z } from "zod";

// Base schemas
export const PlaceSchema = z.object({
  id: z.string(),
  name: z.string(),
  destination: z.string(),
  category: z.string(),
  description: z.string().optional(),
  lat: z.number().optional(),
  lng: z.number().optional(),
  address: z.string().optional(),
  openingHours: z.record(z.string(), z.string()).optional(), // e.g., { "Monday": "09:00-17:00" }
  estimatedVisitDuration: z.number().optional(), // minutes
  estimatedCost: z.number().optional(),
  rating: z.number().optional(),
  imageUrl: z.string().optional(),
  source: z.string().optional(),
});

export type Place = z.infer<typeof PlaceSchema>;

// Internal pipeline state
export interface PipelineState {
  tripId?: string;
  preferences: {
    origin: string;
    destination: string;
    destinations?: string[];
    startDate: string;
    endDate: string;
    travelers: number;
    budget: number; // total budget
    budgetTier?: "cheap" | "moderate" | "luxury" | "compare";
    currency: string;
    travelStyle: string; // "Relaxed", "Adventure", etc.
    transportPreference: string;
    hotelCategory: string;
    foodPreference: string;
    pace?: string;
    interests?: string[];
    dietary?: string[];
    accessibility?: string[];
    additionalNotes?: string;
    userProfileWeights?: Record<string, number>;
  };
  context: {
    destinationOverview?: string;
    weatherSummary?: string;
    seasonalConsiderations?: string;
    transportTips?: string;
  };
  discoveredPlaces: Place[];
  rankedPlaces: (Place & { score: number })[];
  itineraryDraft?: any; // To be structured
  optimizedItinerary?: any;
  finalItinerary?: any;
  budgetSummary?: {
    accommodation: number;
    transportation: number;
    food: number;
    activities: number;
    miscellaneous: number;
    total: number;
  };
  warnings: string[];
}

// Final output schema (aligned with user request)
export const ActivitySchema = z.object({
  title: z.string(),
  placeId: z.string().optional(), // References our internal Place ID or external API ID
  location: z.string().optional(),
  category: z.string(),
  startTime: z.string(),
  endTime: z.string(),
  durationMinutes: z.number(),
  description: z.string(),
  estimatedCost: z.number(),
  travelTimeMinutes: z.number(),
  transportation: z.string(),
  priority: z.enum(["must_visit", "recommended", "optional"]),
  bookingRequired: z.boolean().default(false),
});

export const DaySchema = z.object({
  dayNumber: z.number(),
  date: z.string(),
  theme: z.string(),
  activities: z.array(ActivitySchema),
  estimatedDailyCost: z.number(),
});

export const FinalItinerarySchema = z.object({
  tripSummary: z.object({
    destination: z.string(),
    duration: z.number(),
    travelers: z.number(),
    estimatedTotal: z.number(),
    currency: z.string(),
    travelTips: z.array(z.string()).optional(),
    packingList: z.array(z.string()).optional(),
    financialAdvice: z.array(z.string()).describe("3-4 tips on tipping etiquette, cash vs card, and local currency advice for this destination").optional(),
  }),
  days: z.array(DaySchema),
});

export type FinalItinerary = z.infer<typeof FinalItinerarySchema>;

// ===== Multi-Destination Schemas =====

export const DestinationEntrySchema = z.object({
  name: z.string().min(1),
  country: z.string().optional(),
  state: z.string().optional(),
  numberOfDays: z.number().min(1).max(30),
  order: z.number(),
  lat: z.number().optional(),
  lng: z.number().optional(),
  customPreferences: z.object({
    pace: z.string().optional(),
    interests: z.array(z.string()).optional(),
    budgetWeight: z.number().optional(), // 0.5 = lower priority, 1.5 = higher
    accommodationType: z.string().optional(),
  }).optional(),
});

export type DestinationEntry = z.infer<typeof DestinationEntrySchema>;

export const TransferSchema = z.object({
  from: z.string(),
  to: z.string(),
  mode: z.enum(["flight", "train", "bus", "car", "ferry"]),
  estimatedDurationMinutes: z.number(),
  estimatedCost: z.number(),
  distanceKm: z.number().optional(),
  notes: z.string().optional(),
});

export type Transfer = z.infer<typeof TransferSchema>;

export const DestinationBudgetSchema = z.object({
  accommodation: z.number(),
  food: z.number(),
  activities: z.number(),
  localTransport: z.number(),
  total: z.number(),
});

export const MultiDestDaySchema = z.object({
  dayNumber: z.number(),
  date: z.string(),
  destinationName: z.string(),
  isTransferDay: z.boolean().default(false),
  theme: z.string(),
  activities: z.array(ActivitySchema),
  estimatedDailyCost: z.number(),
});

export const MultiDestDestinationSchema = z.object({
  name: z.string(),
  order: z.number(),
  startDate: z.string(),
  endDate: z.string(),
  numberOfDays: z.number(),
  transferFromPrevious: TransferSchema.optional(),
  days: z.array(MultiDestDaySchema),
  destinationBudget: DestinationBudgetSchema,
});

export const MultiDestItinerarySchema = z.object({
  tripSummary: z.object({
    route: z.string(),
    totalDays: z.number(),
    destinationCount: z.number(),
    travelers: z.number(),
    estimatedTotal: z.number(),
    currency: z.string(),
    perPerson: z.number(),
    perDay: z.number(),
    travelTips: z.array(z.string()).optional(),
  }),
  destinations: z.array(MultiDestDestinationSchema),
  interTransportBudget: z.number(),
});

export type MultiDestItinerary = z.infer<typeof MultiDestItinerarySchema>;

// Multi-destination pipeline state
export interface MultiDestPipelineState {
  tripId?: string;
  isMultiDestination: true;
  preferences: PipelineState["preferences"];
  destinationEntries: DestinationEntry[];
  optimizedOrder?: DestinationEntry[];
  routeOptimizationSuggested?: boolean;
  transfers: Transfer[];
  perDestinationContext: Record<string, PipelineState["context"]>;
  perDestinationPlaces: Record<string, Place[]>;
  perDestinationRanked: Record<string, (Place & { score: number })[]>;
  multiDestItinerary?: MultiDestItinerary;
  budgetSummary?: {
    perDestination: Record<string, z.infer<typeof DestinationBudgetSchema>>;
    interTransport: number;
    total: number;
    perPerson: number;
    perDay: number;
  };
  warnings: string[];
}
