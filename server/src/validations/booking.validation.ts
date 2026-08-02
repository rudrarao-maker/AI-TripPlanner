import { z } from "zod";

export const createBookingSchema = z.object({
  body: z.object({
    tripId: z.string().uuid("Invalid trip ID").optional(),
    type: z.enum(["flight", "hotel", "activity"]),
    totalAmount: z.number().positive("Total amount must be greater than 0"),
    currency: z.string().length(3).optional().default("INR"),
    flightDetails: z.object({
      origin: z.string(),
      destination: z.string(),
      departureTime: z.string().datetime(),
      arrivalTime: z.string().datetime(),
      airline: z.string(),
      flightNumber: z.string(),
      class: z.string(),
      passengers: z.number().int().positive()
    }).optional(),
    hotelDetails: z.object({
      hotelName: z.string(),
      location: z.string(),
      checkIn: z.string().datetime(),
      checkOut: z.string().datetime(),
      roomType: z.string(),
      guests: z.number().int().positive()
    }).optional()
  })
});
