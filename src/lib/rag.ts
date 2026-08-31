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

import { redis } from "@/lib/redis";

export async function retrieveSimilarContext(query: string, limit: number = 3) {
  const cacheKey = `rag:context:${query.replace(/[^a-zA-Z0-9]/g, '_')}:${limit}`;
  
  if (redis) {
    try {
      const cachedResults = await redis.get(cacheKey);
      if (cachedResults) {
        return cachedResults as any[];
      }
    } catch (e) {
      console.warn("Redis cache read failed for RAG:", e);
    }
  }

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

  if (redis && results.length > 0) {
    try {
      // Cache for 24 hours
      await redis.setex(cacheKey, 86400, results);
    } catch (e) {
      console.warn("Redis cache write failed for RAG:", e);
    }
  }

  return results;
}
