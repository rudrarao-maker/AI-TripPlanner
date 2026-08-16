import { google } from "@ai-sdk/google";
import { streamText } from "ai";

export async function POST(req: Request) {
  try {
    const { messages, itineraryContext } = await req.json();

    const systemPrompt = `You are a highly capable AI Travel Concierge for Trip Planner.
You have been provided with the context of the user's current active itinerary.
Use this context to answer questions, suggest modifications, and offer hyper-local recommendations.
If they ask about swapping an activity, recommend alternatives that fit the same vibe and budget.

Current Itinerary Context:
${JSON.stringify(itineraryContext, null, 2)}

Be concise, enthusiastic, and highly specific to their destination.`;

    const result = streamText({
      model: google("gemini-3.1-pro-preview"),
      system: systemPrompt,
      messages,
    });

    return result.toTextStreamResponse();
  } catch (error) {
    console.error("Chat Error:", error);
    return new Response(JSON.stringify({ error: "Failed to generate chat response" }), { status: 500 });
  }
}
