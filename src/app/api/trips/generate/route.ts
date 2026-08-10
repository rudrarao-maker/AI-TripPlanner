import { NextResponse } from "next/server";
import { generateObject, streamObject } from "ai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { z } from "zod";
import { ratelimit } from "@/lib/ratelimit";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/db";
import { users, trips } from "@/db/schema";
import { eq, sql } from "drizzle-orm";

const google = createGoogleGenerativeAI({
  apiKey: process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY,
});

const PlanSchema = z.object({
  title: z.string().describe("A catchy title for the trip"),
  origin: z.string().describe("Origin city"),
  destination: z.string().describe("Destination city"),
  startDate: z.string().describe("YYYY-MM-DD"),
  endDate: z.string().describe("YYYY-MM-DD"),
  budget: z.number().describe("Total estimated budget"),
  flightsCost: z.number().describe("Estimated total cost for flights/travel from origin to destination"),
  currency: z.string().describe("Currency code, e.g. INR"),
  days: z.array(z.object({
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
  }))
});

export const maxDuration = 60; // Allow 60s for LLM processing

export async function POST(req: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_URL !== "https://dummy-upstash.upstash.io") {
      const { success } = await ratelimit.limit(userId);
      if (!success) {
        return NextResponse.json({ error: "Rate limit exceeded. Please try again later." }, { status: 429 });
      }
    }

    // --- PRICING GATE LOGIC ---
    const userRecords = await db.select().from(users).where(eq(users.clerkId, userId)).limit(1);
    if (userRecords.length > 0) {
      const user = userRecords[0];
      
      // If user is on the Free plan, enforce the 3 trip limit
      if (user.planType === "free" || user.subscriptionStatus !== "active") {
        const [tripCount] = await db.select({ count: sql<number>`count(*)` })
          .from(trips)
          .where(eq(trips.userId, userId));
          
        if (Number(tripCount.count) >= 3) {
          return NextResponse.json({ 
            error: "Free plan limit reached (3 trips). Please upgrade to Pro or Premium to generate unlimited trips!" 
          }, { status: 403 });
        }
      }
    }
    // -------------------------

    const preferences = await req.json();
    const baseBudget = Number(preferences.budget) || 100000;

    const planTiers = [
      { id: "cheap", label: "💰 Cheap", hotelCategory: "budget", budget: Math.round(baseBudget * 0.6), tag: "Cheapest" },
      { id: "moderate", label: "💙 Moderate", hotelCategory: "4-star", budget: baseBudget, tag: "Best Value" },
      { id: "luxury", label: "💎 Luxury", hotelCategory: "luxury", budget: Math.round(baseBudget * 1.8), tag: "Most Comfort" },
    ];

    if (preferences.budgetTier === "compare") {
      // Comparison generates multiple static plans at once (hard to stream into one UI component easily)
      const plans = await Promise.all(planTiers.map(async (tier) => {
        const prompt = `Create a travel itinerary based on these preferences: ${JSON.stringify(preferences)}. Ensure strictly ${tier.hotelCategory} tier and total budget around ${tier.budget}.`;
        try {
          const result = await generateObject({
            model: google(process.env.GEMINI_MODEL || "gemini-flash-latest"),
            system: "You are an expert AI travel agent. Generate a detailed, realistic, and culturally immersive travel itinerary perfectly matching the requested budget tier and exact number of days.",
            prompt,
            schema: PlanSchema,
          });
          return { ...result.object, _tier: tier, id: `temp-${tier.id}-${Date.now()}` };
        } catch (err) {
          console.error("Inner generation error:", err);
          throw new Error("Generation failed for comparison.");
        }
      }));
      return NextResponse.json({ success: true, data: plans, isStream: false });
    }

    // Stream Single Plan
    const tier = planTiers.find(t => t.id === preferences.budgetTier) || planTiers[1];
    const prompt = `Create a travel itinerary based on these preferences: ${JSON.stringify(preferences)}. Ensure strictly ${tier.hotelCategory} tier and total budget around ${tier.budget}.`;

    const result = await streamObject({
      model: google(process.env.GEMINI_MODEL || "gemini-flash-latest"),
      system: "You are an expert AI travel agent. Generate a detailed, realistic, and culturally immersive travel itinerary.",
      prompt,
      schema: PlanSchema,
    });

    return result.toTextStreamResponse();
  } catch (error: any) {
    console.error("Trip Generation Route Error:", error);
    return NextResponse.json({ error: "Failed to generate trips." }, { status: 500 });
  }
}
