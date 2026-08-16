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
  travelTips: z.array(z.string()).describe("List of important tips, e.g. passport/visa reminders or transport alternatives like Train/Car").optional(),
  packingList: z.array(z.string()).describe("Smart packing list items tailored to the destination, weather, and activities").optional(),
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

// Helper to fetch weather for a destination to make the AI weather-aware
async function getDestinationWeather(destination: string) {
  try {
    // 1. Geocode with free Nominatim API
    const geoRes = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(destination)}&limit=1`, { headers: { "User-Agent": "TripPlannerAI" } });
    const geoData = await geoRes.json();
    if (!geoData || geoData.length === 0) return null;
    
    const lat = geoData[0].lat;
    const lon = geoData[0].lon;

    // 2. Fetch Open-Meteo
    const meteoRes = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max&timezone=auto`);
    const meteoData = await meteoRes.json();
    
    if (meteoData && meteoData.daily) {
      // Create a short summary of the upcoming week's weather
      let summary = `Upcoming weather for ${destination}:\n`;
      for(let i = 0; i < Math.min(5, meteoData.daily.time.length); i++) {
        const date = meteoData.daily.time[i];
        const maxT = meteoData.daily.temperature_2m_max[i];
        const minT = meteoData.daily.temperature_2m_min[i];
        const rainChance = meteoData.daily.precipitation_probability_max[i];
        
        let condition = "Clear/Cloudy";
        if (rainChance > 50) condition = "High chance of rain";
        else if (rainChance > 20) condition = "Possible showers";

        summary += `- ${date}: ${minT}°C to ${maxT}°C, ${condition} (${rainChance}% rain chance)\n`;
      }
      return summary;
    }
  } catch (error) {
    console.error("Failed to fetch weather context:", error);
  }
  return null;
}

export async function POST(req: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }


    const preferences = await req.json();
    const baseBudget = Number(preferences.budget) || 100000;
    
    // Calculate exact number of days
    const start = new Date(preferences.startDate);
    const end = new Date(preferences.endDate);
    const numDays = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));

    // Helper to generate a realistic mock trip when API is rate-limited
    const generateMockTrip = (tier: any, prefs: any, days: number) => {
      const mockDays = [];
      
      const morningIdeas = [
        { name: "Historical Walking Tour", category: "sightseeing", desc: "Discover the ancient secrets and history." },
        { name: "Local Market Exploration", category: "shopping", desc: "Browse authentic local crafts and spices." },
        { name: "Morning Scenic Hike", category: "sightseeing", desc: "A beautiful trek to catch the early views." },
        { name: "Museum Visit", category: "sightseeing", desc: "Explore the most famous exhibits in the area." },
        { name: "Coffee Culture Walk", category: "food", desc: "Taste the finest local morning brews." },
      ];
      
      const afternoonIdeas = [
        { name: "Authentic Cuisine Tasting", category: "food", desc: "Enjoy a multi-course local specialty lunch." },
        { name: "Art Gallery Hopping", category: "sightseeing", desc: "Visit contemporary and classic local art spaces." },
        { name: "Coastal Boat Ride", category: "transport", desc: "A relaxing breeze and stunning water views." },
        { name: "Traditional Cooking Class", category: "food", desc: "Learn to cook famous regional dishes." },
        { name: "Boutique Shopping", category: "shopping", desc: "Find unique souvenirs and designer goods." },
      ];
      
      const eveningIdeas = [
        { name: "Sunset Viewpoint", category: "sightseeing", desc: "Watch the sun dip below the horizon." },
        { name: "Fine Dining Experience", category: "food", desc: "An upscale dinner with a view." },
        { name: "Night Market Street Food", category: "food", desc: "Taste incredible local street delicacies." },
        { name: "Live Cultural Show", category: "other", desc: "Experience traditional music and dance." },
        { name: "Rooftop Lounge", category: "food", desc: "Relax with drinks overlooking the city lights." },
      ];

      for (let i = 1; i <= days; i++) {
        const currentDate = new Date(start.getTime() + (i - 1) * 24 * 60 * 60 * 1000);
        
        // Pick unique activities based on the day number
        const mAct = morningIdeas[i % morningIdeas.length];
        const aAct = afternoonIdeas[i % afternoonIdeas.length];
        const eAct = eveningIdeas[i % eveningIdeas.length];

        mockDays.push({
          dayNumber: i,
          date: currentDate.toISOString().split('T')[0], // YYYY-MM-DD format
          activities: [
            {
              time: "09:00 AM",
              name: mAct.name,
              location: "City Center",
              coordinates: { lat: 0, lng: 0 },
              description: mAct.desc,
              category: mAct.category,
              estimatedCost: Math.round(tier.budget * 0.05 / days),
              currency: prefs.currency || 'INR'
            },
            {
              time: "01:00 PM",
              name: aAct.name,
              location: "Downtown",
              coordinates: { lat: 0, lng: 0 },
              description: aAct.desc,
              category: aAct.category,
              estimatedCost: Math.round(tier.budget * 0.05 / days),
              currency: prefs.currency || 'INR'
            },
            {
              time: "06:00 PM",
              name: eAct.name,
              location: "Viewpoint",
              coordinates: { lat: 0, lng: 0 },
              description: eAct.desc,
              category: eAct.category,
              estimatedCost: Math.round(tier.budget * 0.05 / days),
              currency: prefs.currency || 'INR'
            }
          ],
          hotel: { name: `The ${tier.label} Resort ${prefs.destination || 'Paradise'}`, rating: tier.id === 'luxury' ? 5 : 4, pricePerNight: Math.round(tier.budget * 0.3 / days) }
        });
      }
      return {
        title: `${days}-Day ${tier.label} Escape to ${prefs.destination}`,
        origin: prefs.origin,
        destination: prefs.destination,
        startDate: prefs.startDate,
        endDate: prefs.endDate,
        budget: tier.budget,
        currency: prefs.currency || 'INR',
        flightsCost: Math.round(tier.budget * 0.25),
        packingList: ["Clothing", "Toiletries", "Documents", "Electronics"],
        days: mockDays,
        _tier: tier,
        id: `mock-${tier.id}-${Date.now()}`
      };
    };

    const planTiers = [
      { id: "cheap", label: "💰 Cheap", hotelCategory: "budget", budget: Math.round(baseBudget * 0.6), tag: "Cheapest" },
      { id: "moderate", label: "💙 Moderate", hotelCategory: "4-star", budget: baseBudget, tag: "Best Value" },
      { id: "luxury", label: "💎 Luxury", hotelCategory: "luxury", budget: Math.round(baseBudget * 1.8), tag: "Most Comfort" },
    ];

    if (preferences.budgetTier === "compare") {
      // Comparison generates multiple static plans at once
      const plans = await Promise.all(planTiers.map(async (tier) => {
        const prompt = `You must generate a strict ${numDays}-day travel itinerary for a trip from ${preferences.origin} to ${preferences.destination}.
        Preferences: ${JSON.stringify(preferences)}.
        STRICT CONSTRAINTS:
        - Itinerary MUST have exactly ${numDays} days.
        - Ensure strictly ${tier.hotelCategory} tier accommodations.
        - The total estimated cost must be around ${tier.budget} ${preferences.currency || 'INR'}.
        - If the destination is foreign relative to the origin, you MUST add a passport/visa reminder in the "travelTips" array.
        - If the destination is in the same state/country, you MUST suggest Train or Car as alternative transport modes in the "travelTips" array.
        - Generate a highly personalized "packingList" tailored to the destination and the provided weather context.`;
        
        try {
          const result = await generateObject({
            model: google(process.env.GEMINI_MODEL || "gemini-1.5-flash-latest"),
            system: `You are an expert AI travel agent. You MUST follow all strict constraints. Generate a realistic and culturally immersive travel itinerary perfectly matching the requested budget tier and exact number of days (${numDays} days). Your output must contain exactly ${numDays} items in the "days" array.`,
            prompt,
            schema: PlanSchema,
          });
          return { ...result.object, _tier: tier, id: `temp-${tier.id}-${Date.now()}` };
        } catch (err: any) {
          console.log("Inner generation error (falling back to mock):", err?.message || err);
          return generateMockTrip(tier, preferences, numDays);
        }
      }));
      return NextResponse.json({ success: true, data: plans, isStream: false });
    }

    // Stream Single Plan
    const tier = planTiers.find(t => t.id === preferences.budgetTier) || planTiers[1];
    
    // Fetch Weather context
    let weatherContext = "";
    if (preferences.destinations && preferences.destinations.length > 0) {
      const weatherSummary = await getDestinationWeather(preferences.destinations[0]);
      if (weatherSummary) {
        weatherContext = `\n\nCRITICAL WEATHER CONTEXT:\n${weatherSummary}\nPlease adapt the itinerary to this forecast (e.g., schedule indoor activities on rainy days).`;
      }
    }

    // Process Dietary and Accessibility
    let constraintsContext = "";
    if (preferences.dietary && preferences.dietary.length > 0) {
      constraintsContext += `\nDietary Requirements: ${preferences.dietary.join(", ")}. Ensure ALL restaurant recommendations strictly adhere to these.`;
    }
    if (preferences.accessibility && preferences.accessibility.length > 0) {
      constraintsContext += `\nAccessibility Needs: ${preferences.accessibility.join(", ")}. Ensure ALL attractions and hotels are suitable for these needs.`;
    }

    const prompt = `You must generate a strict ${numDays}-day travel itinerary from ${preferences.origin} to ${preferences.destination}. 
    Preferences: ${JSON.stringify(preferences)}.
    STRICT CONSTRAINTS:
    - Itinerary MUST have exactly ${numDays} days.
    - Budget constraint: approximately ${tier.budget} ${preferences.currency || 'INR'}.
    - Hotel category expected: ${tier.hotelCategory}.
    - If the destination is foreign relative to the origin, you MUST add a passport/visa reminder in the "travelTips" array.
    - If the destination is in the same state/country, you MUST suggest Train or Car as alternative transport modes in the "travelTips" array.
    ${constraintsContext}`;

    const systemPrompt = `You are an expert AI travel agent. You MUST generate an itinerary with exactly ${numDays} days in the days array. Generate a realistic and culturally immersive travel itinerary.${weatherContext}`;

    try {
      const result = await streamObject({
        model: google(process.env.GEMINI_MODEL || "gemini-1.5-flash-latest"),
        system: systemPrompt,
        prompt,
        schema: PlanSchema,
      });

      return result.toTextStreamResponse();
    } catch (error: any) {
      console.log("Trip Generation Route Error (falling back to mock stream):", error?.message || error);
      
      // Generate a mock trip and format it as an ai-sdk event stream string
      const mockTrip = generateMockTrip(tier, preferences, numDays);
      const streamContent = `0:${JSON.stringify(mockTrip)}\n`;
      
      return new Response(streamContent, {
        headers: { 'Content-Type': 'text/event-stream' }
      });
    }
  } catch (e: any) {
    console.error("Global route error:", e);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
