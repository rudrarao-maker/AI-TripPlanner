import { z } from "zod";
import { generateObject } from "ai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";

const google = createGoogleGenerativeAI({
  apiKey: process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY,
});

export const SocialPlaceSchema = z.object({
  name: z.string().describe("The name of the restaurant, cafe, hotel, or attraction."),
  category: z.enum(["food", "hotel", "sightseeing", "shopping", "transport", "other"]).describe("The category of the place."),
  location: z.string().describe("The city or neighborhood where this is located."),
  description: z.string().describe("A brief 1-2 sentence description based on why it was recommended in the post."),
  estimatedCost: z.number().optional().describe("An estimated cost in INR if mentioned (e.g. 'cheap eats', 'luxury'). Default to 0 if unknown."),
});

export type ParsedSocialPlace = z.infer<typeof SocialPlaceSchema>;

export async function parseSocialUrl(url: string, mockMetadata?: string): Promise<ParsedSocialPlace> {
  const prompt = `
    You are an expert travel agent AI. A user has pasted a link to a social media post (e.g. TikTok, Instagram) because they want to add the place featured in the video to their itinerary.
    
    URL provided: ${url}
    Extracted Metadata/Caption: ${mockMetadata || "No caption available. Infer from the URL slug if possible."}
    
    Your job is to identify the Point of Interest (POI) and categorize it. If the URL contains something like "best-cafe-in-paris-cafe-de-flore", extract "Cafe de Flore" as the name, "Paris" as the location, and "food" as the category.
  `;

  try {
    const { object } = await generateObject({
      model: google(process.env.GEMINI_MODEL || "gemini-3.1-pro-preview"),
      schema: SocialPlaceSchema,
      prompt,
    });

    return object;
  } catch (error) {
    console.error("Error parsing social url with Gemini:", error);
    throw new Error("Failed to extract location data. The AI could not identify a place in this link.");
  }
}
