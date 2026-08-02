import { z } from "zod";

export const tripSchema = z.object({
  body: z.object({
    origin: z.string().min(1, "Origin is required"),
    destination: z.string().min(1, "Destination is required"),
    startDate: z.string().datetime({ message: "Invalid start date" }),
    endDate: z.string().datetime({ message: "Invalid end date" }),
    travelers: z.number().int().positive("Travelers must be at least 1"),
    budget: z.number().positive("Budget must be greater than 0"),
    currency: z.string().length(3, "Currency must be a 3-letter code"),
    travelStyle: z.string().min(1, "Travel style is required"),
    transportPreference: z.string().min(1, "Transport preference is required"),
    hotelCategory: z.string().min(1, "Hotel category is required"),
    foodPreference: z.string().min(1, "Food preference is required"),
  })
});

export const regenerateDaySchema = z.object({
  body: z.object({
    preferences: z.object({
      travelStyle: z.string().optional(),
      budget: z.number().optional(),
      pace: z.string().optional(),
      interests: z.array(z.string()).optional(),
    }).optional()
  }),
  params: z.object({
    id: z.string().uuid("Invalid trip ID"),
    dayId: z.string().uuid("Invalid day ID")
  })
});

export const alternativeActivitySchema = z.object({
  params: z.object({
    activityId: z.string().uuid("Invalid activity ID")
  }),
  query: z.object({
    preferences: z.string().optional()
  })
});
