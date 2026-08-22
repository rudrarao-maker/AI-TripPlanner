import { streamText } from "ai";
import { google } from "@ai-sdk/google";
import { auth } from "@clerk/nextjs/server";
import { validateInput, AIChatSchema } from "@/lib/validation";
import { applyRateLimit, aiChatLimit } from "@/lib/apiRateLimit";
import { logger } from "@/lib/logger";

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }

    // Rate limiting
    const rateResult = await applyRateLimit(aiChatLimit, `ai-chat:${userId}`);
    if (!rateResult.allowed) {
      logger.warn("AI chat rate limited", { userId });
      return new Response(
        JSON.stringify({ error: "Rate limit exceeded. Please wait before sending more messages." }),
        { status: 429, headers: { "Content-Type": "application/json", ...rateResult.headers } }
      );
    }

    // Input validation
    const body = await req.json();
    const validation = validateInput(AIChatSchema, body);
    if (!validation.success) {
      return new Response(
        JSON.stringify({ error: "Invalid input", details: validation.errors }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const result = await streamText({
      model: google(process.env.GEMINI_MODEL || "gemini-2.5-flash"),
      prompt: validation.data.prompt,
    });

    logger.info("AI chat request", { userId, promptLength: validation.data.prompt.length });
    return result.toTextStreamResponse();
  } catch (error: any) {
    logger.error("AI Error", { error: error.message, stack: error.stack });
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
