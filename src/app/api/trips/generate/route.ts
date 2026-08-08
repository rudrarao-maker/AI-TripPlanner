import { NextResponse } from "next/server";
import { generateObject } from "ai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { z } from "zod";
import { ratelimit } from "@/lib/ratelimit";
import { auth } from "@clerk/nextjs/server";

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
      description: z.string().describe("Short description"),
      category: z.string().describe("transport|sightseeing|food|hotel|shopping|other"),
      estimatedCost: z.number(),
      currency: z.string().default("INR")
    }))
  }))
});

export async function POST(req: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_URL !== "https://dummy-upstash.upstash.io") {
      const { success, limit, reset, remaining } = await ratelimit.limit(userId);
      if (!success) {
        return NextResponse.json({ error: "Rate limit exceeded. Please try again later." }, { 
          status: 429,
          headers: {
            "X-RateLimit-Limit": limit.toString(),
            "X-RateLimit-Remaining": remaining.toString(),
            "X-RateLimit-Reset": reset.toString()
          }
        });
      }
    }

    const preferences = await req.json();
    const baseBudget = Number(preferences.budget) || 100000;

    const planTiers = [
      {
        id: "cheap",
        label: "💰 Cheap",
        hotelCategory: "budget",
        budget: Math.round(baseBudget * 0.6),
        tag: "Cheapest",
      },
      {
        id: "moderate",
        label: "💙 Moderate",
        hotelCategory: "4-star",
        budget: baseBudget,
        tag: "Best Value",
      },
      {
        id: "luxury",
        label: "💎 Luxury",
        hotelCategory: "luxury",
        budget: Math.round(baseBudget * 1.8),
        tag: "Most Comfort",
      },
    ];

    const generatePlan = async (tier: any) => {
      const prompt = `Create a travel itinerary based on these preferences: ${JSON.stringify(preferences)}.
IMPORTANT CONSTRAINTS:
1. You MUST design this as a strictly ${tier.hotelCategory} tier trip.
2. The TOTAL budget MUST be exactly around ${tier.budget} amount for ${preferences.travelers || 1} travelers.
3. You MUST generate the exact number of days requested based on the startDate (${preferences.startDate}) and endDate (${preferences.endDate}).
4. Ensure transport reflects their preference.
5. Ensure hotels and activities match the ${tier.hotelCategory} level.`;

      try {
        const result = await generateObject({
          model: google(process.env.GEMINI_MODEL || "gemini-1.5-pro"),
          system: "You are an expert AI travel agent. Generate a detailed, realistic, and culturally immersive travel itinerary perfectly matching the requested budget tier and exact number of days.",
          prompt,
          schema: PlanSchema,
        });
        return { ...result.object, _tier: tier, id: `temp-${tier.id}-${Date.now()}` };
      } catch (err) {
        console.warn(`⚠️ AI Generation Failed for ${tier.id}. Falling back to mock data.`, err);
        // Mock fallback logic
        const start = preferences.startDate ? new Date(preferences.startDate) : new Date();
        const end = preferences.endDate ? new Date(preferences.endDate) : new Date(new Date().setDate(start.getDate() + 4));
        const daysCount = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 3600 * 24)) + 1);
        
        const totalBudget = tier.budget;
        const flightsCost = Math.round(totalBudget * 0.3);
        const dailyBudget = (totalBudget - flightsCost) / daysCount;
        const hotelCost = Math.round(dailyBudget * 0.4);
        const foodCost = Math.round(dailyBudget * 0.3);
        const activityCost = Math.round(dailyBudget * 0.3);

        const days = Array.from({ length: daysCount }).map((_, i) => {
          const date = new Date(start);
          date.setDate(date.getDate() + i);
          return {
            dayNumber: i + 1,
            date: date.toISOString().split("T")[0],
            activities: [
              { name: "Check-in & Relax", description: `Settle into your ${tier.hotelCategory} hotel.`, time: "14:00", location: preferences.destination + " Hotel", category: "hotel", estimatedCost: hotelCost, currency: "INR" },
              { name: "Local Sightseeing", description: `Explore ${preferences.destination}.`, time: "16:00", location: `Central ${preferences.destination}`, category: "sightseeing", estimatedCost: activityCost, currency: "INR" },
              { name: "Dinner", description: "Enjoy local cuisine.", time: "19:00", location: `Downtown ${preferences.destination}`, category: "food", estimatedCost: foodCost, currency: "INR" }
            ]
          };
        });

        return {
          id: `temp-${tier.id}-${Date.now()}`,
          title: `Ultimate ${preferences.destination} Getaway`,
          origin: preferences.origin || "Home",
          destination: preferences.destination,
          startDate: start.toISOString().split("T")[0],
          endDate: end.toISOString().split("T")[0],
          budget: totalBudget,
          flightsCost: flightsCost,
          currency: "INR",
          days: days,
          _tier: tier,
        };
      }
    };

    // If budgetTier is compare, generate all 3. If a specific tier, generate only that one.
    let plansToGenerate = planTiers;
    if (preferences.budgetTier && preferences.budgetTier !== "compare") {
      plansToGenerate = planTiers.filter(t => t.id === preferences.budgetTier);
    }

    const plans = await Promise.all(plansToGenerate.map(tier => generatePlan(tier)));

    return NextResponse.json({ success: true, data: plans });
  } catch (error: any) {
    console.error("Trip Generation Route Error:", error);
    return NextResponse.json({ error: "Failed to generate trips." }, { status: 500 });
  }
}
