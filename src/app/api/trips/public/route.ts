import { NextResponse } from "next/server";
import { db } from "@/db";
import { trips } from "@/db/schema";
import { eq, desc, ilike, and, or } from "drizzle-orm";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q");

    let whereClause;
    
    if (query) {
      // Fuzzy search using ilike (powered by pg_trgm if index is added later)
      whereClause = and(
        eq(trips.isPublic, true),
        or(
          ilike(trips.destination, `%${query}%`),
          ilike(trips.title, `%${query}%`)
        )
      );
    } else {
      whereClause = eq(trips.isPublic, true);
    }

    const publicTrips = await db.query.trips.findMany({
      where: whereClause,
      orderBy: [desc(trips.createdAt)],
      limit: 20,
    });

    return NextResponse.json({ success: true, data: publicTrips });
  } catch (error) {
    console.error("Error fetching public trips:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch public trips" }, { status: 500 });
  }
}
