import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/db";
import { trips, activities, tripDays, places } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { generateObject } from "ai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { FinalItinerarySchema, DaySchema } from "@/lib/ai-pipeline/types";

const google = createGoogleGenerativeAI({
  apiKey: process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY,
});

export async function POST(req: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { target, targetId, instructions } = await req.json();
    const params = await props.params;
    const tripId = params.id;

    // Verify ownership
    const tripRecord = await db.query.trips.findFirst({
      where: and(eq(trips.id, tripId), eq(trips.userId, userId)),
      with: {
        tripDays: {
          with: { activities: true }
        }
      }
    });

    if (!tripRecord) {
      return NextResponse.json({ error: "Trip not found or unauthorized" }, { status: 404 });
    }

    if (target === "day") {
      // Regenerate a single day
      const dayRecord = tripRecord.tripDays.find(d => d.id === targetId);
      if (!dayRecord) return NextResponse.json({ error: "Day not found" }, { status: 404 });

      const prompt = `Regenerate Day ${dayRecord.dayNumber} of the trip to ${tripRecord.destination}.
      User Instructions: ${instructions || "Make it better."}
      Current Activities count: ${dayRecord.activities.length}.
      Please generate a replacement day schedule adhering to the same JSON structure.`;

      const result = await generateObject({
        model: google(process.env.GEMINI_MODEL || "gemini-3.1-pro-preview"),
        schema: DaySchema,
        prompt,
      });

      return NextResponse.json({ success: true, updatedDay: result.object });
    }

    return NextResponse.json({ error: "Unsupported target for regeneration" }, { status: 400 });

  } catch (error) {
    console.error("Regenerate route error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
