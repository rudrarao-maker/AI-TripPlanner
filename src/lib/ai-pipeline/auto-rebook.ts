import { z } from "zod";
import { generateObject } from "ai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";

const google = createGoogleGenerativeAI({
  apiKey: process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY,
});

export const RescheduledDaySchema = z.object({
  alerts: z.array(z.string()).describe("Alerts to show the user regarding what was changed (e.g. 'Pushed dinner reservation back by 2 hours')."),
  activities: z.array(z.object({
    title: z.string(),
    category: z.string(),
    location: z.string().optional(),
    description: z.string().optional(),
    estimatedCost: z.number().optional(),
    startTime: z.string().describe("The new start time in HH:mm format."),
    endTime: z.string().optional(),
  })).describe("The complete list of activities for the day, with times adjusted for the flight delay."),
});

export type RescheduledDay = z.infer<typeof RescheduledDaySchema>;

export async function autoRescheduleDay(
  originalActivities: any[],
  flightDelayMinutes: number,
  flightNumber: string
): Promise<RescheduledDay> {
  const prompt = `
    You are an AI travel assistant acting as an emergency dispatcher. 
    The user's flight (${flightNumber}) has been delayed by ${flightDelayMinutes} minutes.
    
    Here is their original itinerary for the day:
    ${JSON.stringify(originalActivities, null, 2)}
    
    Your job is to rewrite this day's schedule to accommodate the delay.
    Rules:
    1. If the flight is the first activity, shift EVERYTHING after it by at least ${flightDelayMinutes} minutes.
    2. Ensure there is enough time for dinner/lunch.
    3. Generate a helpful alert message explaining exactly what you changed (e.g., "Your flight DL104 was delayed by 120 mins. We shifted your hotel check-in and pushed your dinner reservation to 8:30 PM.")
    
    Return the completely rescheduled day.
  `;

  try {
    const { object } = await generateObject({
      model: google(process.env.GEMINI_MODEL || "gemini-3.1-pro-preview"),
      schema: RescheduledDaySchema,
      prompt,
    });

    return object;
  } catch (error) {
    console.error("Error auto-rescheduling with Gemini:", error);
    throw new Error("Failed to auto-reschedule the itinerary.");
  }
}
