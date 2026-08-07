import { streamText } from "ai";
import { google } from "@ai-sdk/google";

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();

    const result = await streamText({
      model: google("gemini-3.1-pro"),
      prompt: prompt,
    });

    return result.toTextStreamResponse();
  } catch (error: any) {
    console.error("AI Error:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
