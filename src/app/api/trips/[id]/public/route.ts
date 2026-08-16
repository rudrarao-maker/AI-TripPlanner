import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/db";
import { trips } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { logger } from "@/lib/logger";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params;
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const isPublic = Boolean(body.isPublic);

    // Update the trip ensuring only the owner can do it
    const [updatedTrip] = await db
      .update(trips)
      .set({ isPublic, updatedAt: new Date() })
      .where(and(eq(trips.id, resolvedParams.id), eq(trips.userId, userId)))
      .returning();

    if (!updatedTrip) {
      return NextResponse.json({ error: "Trip not found or unauthorized." }, { status: 404 });
    }

    logger.info(`Trip made ${isPublic ? "public" : "private"}`, { tripId: resolvedParams.id, userId });
    return NextResponse.json({ success: true, isPublic: updatedTrip.isPublic });
  } catch (error: any) {
    logger.error("Toggle Public Error", { error: error.message });
    return NextResponse.json({ error: "Failed to update trip visibility." }, { status: 500 });
  }
}
