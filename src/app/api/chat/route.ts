import { google } from "@ai-sdk/google";
import { streamText, tool } from "ai";
import { z } from "zod";

export async function POST(req: Request) {
  try {
    const { messages, itineraryContext } = await req.json();

    const systemPrompt = `You are a highly capable AI Travel Concierge for Trip Planner.
You have been provided with the context of the user's current active itinerary.
Use this context to answer questions, suggest modifications, and offer hyper-local recommendations.
If they ask about swapping an activity, recommend alternatives that fit the same vibe and budget.

Current Itinerary Context:
${JSON.stringify(itineraryContext, null, 2)}

Be concise, enthusiastic, and highly specific to their destination.`;

    const result = streamText({
      model: google(process.env.GEMINI_MODEL || "gemini-2.5-flash"),
      system: systemPrompt,
      messages,
      tools: {
        updateItineraryActivity: tool({
          description: "Surgically update a specific activity in the user's itinerary. Call this when the user asks to replace, swap, or change an activity. You should provide the day number, the original activity title to replace, and the complete details of the new replacement activity.",
          parameters: z.object({
            dayNumber: z.number().describe("The 1-indexed day number (e.g. 2 for Day 2)."),
            activityToReplace: z.string().describe("The exact title of the activity to replace (e.g. 'Eiffel Tower')."),
            newActivity: z.object({
              title: z.string().describe("The name of the new activity."),
              location: z.string().describe("The address or location of the new activity."),
              description: z.string().describe("A brief description of the new activity."),
              category: z.string().describe("The category (e.g. 'sightseeing', 'dining', 'park')."),
              estimatedCost: z.number().describe("Estimated cost in the local currency."),
              startTime: z.string().describe("The start time (e.g. '10:00 AM')."),
              duration: z.string().describe("The duration (e.g. '2 hours')."),
            })
          }),
        }),
        optimizeRoute: tool({
          description: "Optimize or reorder the destinations in a multi-destination trip for the best logical route. Call this when the user asks to reorder, rearrange, or optimize their multi-city route.",
          parameters: z.object({
             triggerId: z.string().describe("A random unique ID to trigger the client-side reorder."),
          }),
        } as any),
        checkWeather: tool({
          description: "Check the current weather and 5-day forecast for a specific location.",
          parameters: z.object({
            location: z.string().describe("The city and country to check weather for (e.g. 'Paris, France')"),
            lat: z.number().describe("Latitude of the location"),
            lng: z.number().describe("Longitude of the location"),
          }),
          execute: async ({ location, lat, lng }: { location: string; lat: number; lng: number }) => {
            try {
              const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,weather_code&daily=temperature_2m_max,temperature_2m_min&timezone=auto`);
              const data = await res.json();
              return {
                location,
                current_temp: data.current.temperature_2m,
                forecast: data.daily.time.slice(0, 3).map((t: any, i: number) => ({
                  date: t,
                  high: data.daily.temperature_2m_max[i],
                  low: data.daily.temperature_2m_min[i]
                }))
              };
            } catch (e) {
              return { error: "Could not fetch weather data." };
            }
          }
        } as any)
      }
    });

    return result.toTextStreamResponse();
  } catch (error) {
    console.error("Chat Error:", error);
    return new Response(JSON.stringify({ error: "Failed to generate chat response" }), { status: 500 });
  }
}
