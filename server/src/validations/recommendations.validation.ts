import { z } from "zod";

export const getHotelsSchema = z.object({
  query: z.object({
    destination: z.string().min(1, "Destination is required"),
    hotelCategory: z.string().optional()
  })
});

export const getRestaurantsSchema = z.object({
  query: z.object({
    destination: z.string().min(1, "Destination is required"),
    foodPreference: z.string().optional()
  })
});

export const getAttractionsSchema = z.object({
  query: z.object({
    destination: z.string().min(1, "Destination is required"),
    travelStyle: z.string().optional()
  })
});
