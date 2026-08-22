import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/db";
import { trips } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { generateObject } from "ai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { z } from "zod";

const google = createGoogleGenerativeAI({
  apiKey: process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY,
});

const ChatResponseSchema = z.object({
  replyMessage: z.string().describe("The conversational reply to the user"),
  actionRequired: z.boolean().describe("Whether this chat requires a change to the itinerary"),
  actionTarget: z.enum(["none", "activity", "day", "trip"]).optional(),
  actionTargetId: z.string().optional(),
  proposedChanges: z.any().optional().describe("The structured change to apply"),
});

export async function POST(req: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { message, contextItinerary } = await req.json();
    const params = await props.params;
    const tripId = params.id;

    // Verify ownership
    const tripRecord = await db.query.trips.findFirst({
      where: and(eq(trips.id, tripId), eq(trips.userId, userId)),
    });
    if (!tripRecord) return NextResponse.json({ error: "Trip not found" }, { status: 404 });

    const prompt = `You are an AI travel assistant helping a user modify their trip to ${tripRecord.destination}.
    The user's message: "${message}"
    
    Current Itinerary Context:
    ${JSON.stringify(contextItinerary).substring(0, 3000)} // Truncated to save tokens
    
    If the user asks to change something (e.g. "replace this expensive dinner", "make Day 2 more relaxed"), you must:
    1. Set actionRequired to true.
    2. Determine the target (activity, day, or trip).
    3. Provide the proposed structured JSON change in proposedChanges.
    4. Provide a friendly replyMessage (e.g. "I reduced Day 2 from 6 activities to 4...")
    
    If the user is just asking a question, answer it in replyMessage and set actionRequired to false.`;

    const result = await generateObject({
      model: google(process.env.GEMINI_MODEL || "gemini-3.1-pro-preview"),
      schema: ChatResponseSchema,
      prompt,
    });

    return NextResponse.json({ success: true, aiResponse: result.object });

  } catch (error) {
    console.error("Chat route error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
