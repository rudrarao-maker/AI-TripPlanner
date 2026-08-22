import { NextResponse } from "next/server";
import { generateObject } from "ai";
import { google } from "@ai-sdk/google";
import { z } from "zod";

export async function POST(req: Request) {
  try {
    const { photoUrls, tripContext } = await req.json();

    if (!photoUrls || photoUrls.length === 0) {
      return NextResponse.json(
        { error: "No photos provided" },
        { status: 400 }
      );
    }

    const { object } = await generateObject({
      model: google("gemini-1.5-flash"),
      system: `You are an AI Travel Memory Assistant. You are given a list of photo URLs and the context of a trip. 
Your goal is to generate a beautiful, nostalgic "Memory Timeline" caption for each photo.
The trip context includes the destination, dates, and some planned activities.
You should try to weave the photos into a story of the trip.`,
      prompt: `Here are the photos: ${JSON.stringify(photoUrls)}
      
Trip Context: ${JSON.stringify(tripContext)}

Generate a memory timeline with engaging captions for these moments.`,
      schema: z.object({
        memories: z.array(
          z.object({
            photoUrl: z.string(),
            caption: z.string().describe("A beautiful, nostalgic caption for this photo (1-2 sentences)."),
            date: z.string().describe("Estimated date or time of day (e.g. 'Morning, Day 1')."),
            location: z.string().describe("The estimated location from the trip context."),
          })
        ),
        overallSummary: z.string().describe("A beautiful paragraph summarizing the entire trip experience based on these photos."),
      }),
    });

    return NextResponse.json({ success: true, data: object });
  } catch (error: any) {
    console.error("Journal generate error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to generate journal" },
      { status: 500 }
    );
  }
}
