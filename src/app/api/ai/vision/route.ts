import { NextResponse } from "next/server";
import { generateObject } from "ai";
import { google } from "@ai-sdk/google";
import { z } from "zod";

export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const { imageBase64, destination, expectedWeather } = await req.json();

    if (!imageBase64) {
      return NextResponse.json({ error: "Missing image" }, { status: 400 });
    }

    // Call Gemini Vision to analyze the suitcase and suggest missing items
    const { object } = await generateObject({
      model: google("gemini-2.5-pro"),
      schema: z.object({
        identifiedItems: z.array(z.string()).describe("List of clothing/packing items seen in the image"),
        missingItems: z.array(z.object({
          item: z.string(),
          reason: z.string()
        })).describe("List of items missing based on the destination and expected weather"),
        feedbackMessage: z.string().describe("A friendly AI message assessing the packing (e.g. 'I see 3 t-shirts, but you are going to Iceland in winter...')")
      }),
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: `Analyze this open suitcase. The user is traveling to ${destination}. The expected weather is ${expectedWeather}. Identify what they have packed and suggest what critical items they are missing.` },
            { type: "image", image: imageBase64 }
          ]
        }
      ]
    });

    return NextResponse.json({ result: object });
  } catch (error: any) {
    console.error("Vision AI Error:", error);
    return NextResponse.json({ error: error.message || "Failed to analyze image" }, { status: 500 });
  }
}
