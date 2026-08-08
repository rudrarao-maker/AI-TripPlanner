import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/db";
import { trips } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { logger } from "@/lib/logger";
import { queryCache, QUERY_CACHE_TTL, cacheFirst } from "@/lib/cache";

export async function GET(req: Request) {
  const start = Date.now();
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const cacheKey = `trips:${userId}`;
    const tripsData = await cacheFirst<typeof trips.$inferSelect[]>(queryCache as any, cacheKey, QUERY_CACHE_TTL, async () => {
      return db.select().from(trips).where(eq(trips.userId, userId)).orderBy(desc(trips.createdAt));
    });

    logger.apiRequest("GET", "/api/trips", 200, Date.now() - start, { userId, count: tripsData.length });
    return NextResponse.json({ success: true, data: tripsData });
  } catch (error: any) {
    logger.error("Fetch Trips Error", { error: error.message, durationMs: Date.now() - start });
    return NextResponse.json(
      { success: false, error: "Failed to fetch trips" },
      { status: 500 }
    );
  }
}
