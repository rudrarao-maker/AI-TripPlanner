import { MultiDestPipelineState, MultiDestItinerarySchema } from "../types";
import { generateObject } from "ai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { retrieveSimilarContext } from "@/lib/rag";

const google = createGoogleGenerativeAI({
  apiKey: process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY,
});

export class MultiItineraryGenerator {
  static async generate(state: MultiDestPipelineState): Promise<MultiDestPipelineState> {
    const { preferences, destinationEntries, transfers, perDestinationRanked } = state;

    // Calculate dates for each destination
    const startDate = new Date(preferences.startDate);
    let currentDate = new Date(startDate);
    const destinationDateRanges: { name: string; start: string; end: string; days: number }[] = [];

    for (const dest of destinationEntries) {
      const destStart = new Date(currentDate);
      const destEnd = new Date(currentDate);
      destEnd.setDate(destEnd.getDate() + dest.numberOfDays - 1);

      destinationDateRanges.push({
        name: dest.name,
        start: destStart.toISOString().split("T")[0],
        end: destEnd.toISOString().split("T")[0],
        days: dest.numberOfDays,
      });

      // Move to next destination (next day after end)
      currentDate = new Date(destEnd);
      currentDate.setDate(currentDate.getDate() + 1);
    }

    const totalDays = destinationEntries.reduce((s, d) => s + d.numberOfDays, 0);
    const route = destinationEntries.map(d => d.name).join(" → ");

    // Build places context per destination
    const placesContext = destinationEntries.map(dest => {
      const ranked = perDestinationRanked[dest.name] || [];
      const topPlaces = ranked.slice(0, 20).map(p =>
        `${p.name} (${p.category}, cost: ${p.estimatedCost})`
      ).join(", ");
      return `${dest.name}: ${topPlaces || "No verified places available, use well-known landmarks"}`;
    }).join("\n\n");

    // Build transfer context
    const transferContext = transfers.map(t =>
      `${t.from} → ${t.to}: ${t.mode}, ~${t.estimatedDurationMinutes} mins, ~${t.estimatedCost} ${preferences.currency}`
    ).join("\n");

    // Retrieve hyper-local hidden gems from RAG Knowledge Base
    const localInsights = await retrieveSimilarContext(`hidden gems, local favorites, off-the-beaten-path in ${route}`, 5);
    const insightsStr = localInsights.map(i => `- ${i.content}`).join("\n");

    const prompt = `You are a professional travel planning AI creating a multi-destination itinerary.

TRIP OVERVIEW:
Route: ${route}
Total Days: ${totalDays}
Travelers: ${preferences.travelers}
Budget: ${preferences.budget} ${preferences.currency}
Pace: ${preferences.pace || "balanced"}
Interests: ${(preferences.interests || []).join(", ") || "General sightseeing"}

DESTINATION SCHEDULE:
${destinationDateRanges.map(d => `${d.name}: ${d.start} to ${d.end} (${d.days} days)`).join("\n")}

INTER-CITY TRANSPORT:
${transferContext || "Use reasonable estimates for transport between cities."}

VERIFIED PLACES PER DESTINATION:
${placesContext}

CRITICAL RULES:
1. The LAST day at each destination (except the final one) is a TRANSFER DAY.
   On transfer days: Morning checkout, travel, afternoon arrival and check-in at next city. Do NOT schedule full-day sightseeing on transfer days.
2. PRIORITIZE HYPER-LOCAL HIDDEN GEMS: We have retrieved local expert knowledge for you. You MUST incorporate these insights into the itinerary over generic tourist traps if they fit the user's preferences.
3. Use ONLY the verified places listed above where possible.
4. For each day, include realistic start/end times and travel time between activities.
5. Budget should be split realistically across destinations.
6. Include accommodation, food, activities, and local transport in each destination budget.
7. Mark transfer days with isTransferDay: true.
8. The route string should be: "${route}"
9. All costs in ${preferences.currency}.

Expert Hyper-Local Insights (RAG Knowledge Base):
${insightsStr || "No hyper-local insights available in knowledge base."}`;

    try {
      const result = await generateObject({
        model: google(process.env.GEMINI_MODEL || "gemini-2.5-flash"),
        schema: MultiDestItinerarySchema,
        prompt,
        system: "You are an expert multi-destination travel planner. Generate structured JSON itineraries with realistic schedules, proper travel-day handling, and accurate budget breakdowns.",
      });

      return {
        ...state,
        multiDestItinerary: result.object,
      };
    } catch (error) {
      console.error("MultiItineraryGenerator error:", error);
      throw new Error("Failed to generate multi-destination itinerary.");
    }
  }
}
