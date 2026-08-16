import { NextResponse } from "next/server";
import { db } from "@/db";
import { trips } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

export async function GET() {
  try {
    const publicTrips = await db.query.trips.findMany({
      where: eq(trips.isPublic, true),
      orderBy: [desc(trips.createdAt)],
      limit: 20,
    });

    return NextResponse.json({ success: true, data: publicTrips });
  } catch (error) {
    console.error("Error fetching public trips:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch public trips" }, { status: 500 });
  }
}
