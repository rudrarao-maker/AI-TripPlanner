import { db } from "@/db";
import { knowledgeBase } from "@/db/schema";
import { embed, embedMany } from "ai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { sql } from "drizzle-orm";

const google = createGoogleGenerativeAI({
  apiKey: process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY,
});

const embeddingModel = google.textEmbeddingModel("text-embedding-004");

export async function generateEmbedding(text: string) {
  const { embedding } = await embed({
    model: embeddingModel,
    value: text,
  });
  return embedding;
}

export async function insertKnowledge(content: string, metadata: any = {}) {
  const embedding = await generateEmbedding(content);
  
  await db.insert(knowledgeBase).values({
    content,
    embedding,
    metadata,
  });
}

export async function retrieveSimilarContext(query: string, limit: number = 3) {
  const queryEmbedding = await generateEmbedding(query);
  const similarity = sql<number>`1 - (${knowledgeBase.embedding} <=> ${queryEmbedding})`;

  const results = await db
    .select({
      id: knowledgeBase.id,
      content: knowledgeBase.content,
      metadata: knowledgeBase.metadata,
      similarity,
    })
    .from(knowledgeBase)
    .where(sql`${similarity} > 0.5`) // Minimum similarity threshold
    .orderBy(sql`${knowledgeBase.embedding} <=> ${queryEmbedding}`)
    .limit(limit);

  return results;
}
