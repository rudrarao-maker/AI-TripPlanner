import { NextResponse } from "next/server";
import { db } from "@/db";
import { trips, users } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { logger } from "@/lib/logger";

export const dynamic = "force-dynamic";

export async function GET() {
  const start = Date.now();
  try {
    // Fetch all public trips and manually join with users table using clerkId
    const publicTrips = await db
      .select({
        id: trips.id,
        title: trips.title,
        destination: trips.destination,
        coverImage: trips.coverImage,
        startDate: trips.startDate,
        endDate: trips.endDate,
        travelers: trips.travelers,
        travelStyle: trips.travelStyle,
        createdAt: trips.createdAt,
        authorName: users.name,
        authorAvatar: users.avatar,
      })
      .from(trips)
      .leftJoin(users, eq(trips.userId, users.clerkId))
      .where(eq(trips.isPublic, true))
      .orderBy(desc(trips.createdAt))
      .limit(50); // Fetch top 50 recent public trips

    logger.apiRequest("GET", "/api/community", 200, Date.now() - start, { count: publicTrips.length });
    return NextResponse.json({ success: true, data: publicTrips });
  } catch (error: any) {
    logger.error("Community Feed Error", { error: error.message, stack: error.stack, durationMs: Date.now() - start });
    return NextResponse.json({ error: "Failed to fetch community feed." }, { status: 500 });
  }
}
