import { NextResponse } from "next/server";
import { generateObject } from "ai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { z } from "zod";
import { auth } from "@clerk/nextjs/server";
import { aiGenerateLimit, applyRateLimit } from "@/lib/apiRateLimit";

const google = createGoogleGenerativeAI({
  apiKey: process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY,
});

const DaySchema = z.object({
  dayNumber: z.number(),
  date: z.string().describe("YYYY-MM-DD"),
  activities: z.array(z.object({
    time: z.string().describe("Time of the activity e.g. 09:00 AM"),
    name: z.string().describe("Activity name"),
    location: z.string().describe("Location name"),
    coordinates: z.object({ lat: z.number(), lng: z.number() }).describe("Approximate latitude and longitude of the location"),
    description: z.string().describe("Short description"),
    category: z.string().describe("transport|sightseeing|food|hotel|shopping|other"),
    estimatedCost: z.number(),
    currency: z.string().default("INR")
  }))
});

export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const rateLimitResult = await applyRateLimit(aiGenerateLimit, userId);
    if (!rateLimitResult.allowed) {
      return NextResponse.json({ error: "Rate limit exceeded" }, { 
        status: 429, 
        headers: rateLimitResult.headers 
      });
    }

    const { dayNumber, existingPlan, preferences } = await req.json();

    if (!dayNumber || !existingPlan || !preferences) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Extract some context
    const budget = existingPlan.budget || preferences.budget || 100000;
    const destination = existingPlan.destination || preferences.destinations?.[0] || "Unknown";

    let constraintsContext = "";
    if (preferences.dietary && preferences.dietary.length > 0) {
      constraintsContext += `\nDietary Requirements: ${preferences.dietary.join(", ")}.`;
    }
    if (preferences.accessibility && preferences.accessibility.length > 0) {
      constraintsContext += `\nAccessibility Needs: ${preferences.accessibility.join(", ")}.`;
    }

    const prompt = `
      You are an expert AI travel agent. We have an existing trip to ${destination}.
      The user wants to completely regenerate Day ${dayNumber} of their itinerary.
      
      Here are their overarching preferences: ${JSON.stringify(preferences)}.
      ${constraintsContext}
      
      Please provide a brand new schedule of activities for Day ${dayNumber}. Make sure the activities are logical, geographically sound, and strictly follow any dietary/accessibility constraints.
    `;

    const result = await generateObject({
      model: google(process.env.GEMINI_MODEL || "gemini-3.1-pro-preview"),
      system: "You are an expert AI travel agent specializing in itinerary generation.",
      prompt,
      schema: DaySchema,
    });

    return NextResponse.json({ success: true, data: result.object });
  } catch (error: any) {
    console.error("Regenerate day error:", error);
    return NextResponse.json(
      { error: "Failed to regenerate day. Please try again." },
      { status: 500 }
    );
  }
}
