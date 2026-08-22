import { PipelineState, FinalItinerarySchema } from "./types";
import { generateObject } from "ai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";

const google = createGoogleGenerativeAI({
  apiKey: process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY,
});

export class ItineraryGenerator {
  static async generate(state: PipelineState): Promise<PipelineState> {
    const { preferences, context, rankedPlaces } = state;
    
    // Calculate exact number of days
    const start = new Date(preferences.startDate);
    const end = new Date(preferences.endDate);
    const numDays = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));

    // Provide a subset of top-ranked places to Gemini to prevent context overflow
    // and force it to use real places
    const topPlacesStr = rankedPlaces.slice(0, 30).map(p => 
      `ID: ${p.id} | Name: ${p.name} | Category: ${p.category} | Cost: ${p.estimatedCost} | Description: ${p.description}`
    ).join("\n");

    const accessibilityStr = preferences.accessibility?.length ? `The travelers require: ${preferences.accessibility.join(', ')}. DO NOT suggest places that violate these needs.` : '';
    const dietaryStr = preferences.dietary?.length ? `Dietary restrictions: ${preferences.dietary.join(', ')}. Food suggestions MUST accommodate this.` : '';
    const paceStr = preferences.pace ? `Pacing preference: ${preferences.pace}. Adjust activity density and breaks accordingly.` : '';

    const prompt = `You are a professional travel-planning AI.
    Create a strict ${numDays}-day travel itinerary for a trip to ${preferences.destination}.
    Preferences: ${JSON.stringify(preferences)}
    Context: ${JSON.stringify(context)}
    
    CRITICAL RULES:
    1. NEVER invent real-world places. You MUST select activities ONLY from the provided Verified Places List below (or generic widely known landmarks if the list is insufficient).
    2. Group activities by geographic proximity.
    3. Include realistic travel time.
    4. Respect the user's budget and pace.
    5. VERY IMPORTANT: The \`packingList\` in \`tripSummary\` MUST be generated dynamically based on the \`weatherSummary\` provided in the Context. If the weather says rain, include rain gear. If it's cold, include winter wear.
    6. Return the exact requested JSON structure.
    7. ${accessibilityStr}
    8. ${dietaryStr}
    9. ${paceStr}
    10. Include 3-4 local financial tips in \`financialAdvice\` (e.g. tipping, cash vs card).
    
    Verified Places List:
    ${topPlacesStr || "No verified places provided. Rely only on highly accurate world knowledge."}
    `;

    let attempts = 0;
    const maxAttempts = 2;

    while (attempts < maxAttempts) {
      try {
        const result = await generateObject({
          model: google(process.env.GEMINI_MODEL || "gemini-3.1-pro-preview"),
          schema: FinalItinerarySchema,
          prompt,
          system: "You are an expert AI travel agent generating highly detailed, geographically sound JSON itineraries.",
        });

        return {
          ...state,
          itineraryDraft: result.object,
        };
      } catch (error) {
        attempts++;
        console.error(`ItineraryGenerator error (Attempt ${attempts}):`, error);
        if (attempts >= maxAttempts) {
          throw new Error("Failed to generate itinerary draft from LLM after multiple attempts.");
        }
      }
    }
    
    return state;
  }
}
