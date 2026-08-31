import { NextResponse } from "next/server";
import { generateObject } from "ai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { z } from "zod";
import { auth } from "@clerk/nextjs/server";
import { aiGenerateLimit, applyRateLimit } from "@/lib/apiRateLimit";

const google = createGoogleGenerativeAI({
  apiKey: process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY,
});

const PromptSchema = z.object({
  destinations: z.array(z.string()).describe("A list of destinations mentioned in the prompt"),
  daysCount: z.number().describe("The total number of days for the trip. Default to 7 if unspecified."),
  travelers: z.number().describe("The total number of travelers. Default to 2 if unspecified."),
  budget: z.number().describe("Estimated budget in total. Default to 100000 if unspecified."),
  travelStyle: z.string().describe("E.g., luxury, backpacker, family, adventure"),
  hotelCategory: z.string().describe("E.g., 5-star, budget, hostel, luxury, 4-star"),
  interests: z.array(z.string()).describe("Any specific interests mentioned, like food, hiking, etc."),
});

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

    const { prompt, imageBase64 } = await req.json();

    if (!prompt && !imageBase64) {
      return NextResponse.json({ error: "Prompt or Image is required" }, { status: 400 });
    }

    const content: any[] = [];
    if (imageBase64) {
      content.push({ 
        type: "text", 
        text: prompt ? `Extract travel preferences from this text and image: "${prompt}"` : `Analyze this image (e.g., an Instagram travel post, a landscape, or a hotel). Extract the likely destination, travel style, and any relevant interests or activities visible.` 
      });
      content.push({
        type: "image",
        image: imageBase64.includes("base64,") ? imageBase64.split("base64,")[1] : imageBase64
      });
    } else {
      content.push({ 
        type: "text", 
        text: `Extract travel preferences from the following prompt: "${prompt}"` 
      });
    }

    const result = await generateObject({
      model: google(process.env.GEMINI_MODEL || "gemini-1.5-pro"),
      system: "You are a travel assistant parsing unstructured text or visual images into a structured travel JSON object. If an image is provided, identify the location (e.g. Eiffel Tower -> Paris) and guess the travel style based on the vibe.",
      messages: [{ role: "user", content }],
      schema: PromptSchema,
    });

    return NextResponse.json({ success: true, data: result.object });
  } catch (error: any) {
    console.error("Parse Prompt Error:", error);
    return NextResponse.json({ error: "Failed to parse prompt." }, { status: 500 });
  }
}
