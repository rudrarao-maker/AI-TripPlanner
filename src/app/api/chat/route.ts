import { NextResponse } from "next/server";
import { streamText } from "ai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { retrieveSimilarContext } from "@/lib/rag";

const google = createGoogleGenerativeAI({
  apiKey: process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();
    
    // Get the latest user message
    const latestMessage = messages[messages.length - 1];
    const userQuery = latestMessage.content;

    // Retrieve relevant context from Knowledge Base
    const contextResults = await retrieveSimilarContext(userQuery);
    const contextText = contextResults.map(r => r.content).join("\n\n");

    const systemPrompt = `You are a helpful travel assistant.
Use the following context from our knowledge base to answer the user's question if relevant.
If the context doesn't have the answer, just answer normally using your own knowledge.

Knowledge Base Context:
${contextText || "No specific local context found."}
`;

    const result = await streamText({
      model: google(process.env.GEMINI_MODEL || "gemini-1.5-pro"),
      system: systemPrompt,
      messages,
    });

    return result.toTextStreamResponse();
  } catch (error) {
    console.error("Chat RAG Route Error:", error);
    return NextResponse.json({ error: "Failed to generate response." }, { status: 500 });
  }
}
