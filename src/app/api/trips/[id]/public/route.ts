import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/db";
import { trips } from "@/db/schema";
import { eq, and } from "drizzle-orm";

export async function PATCH(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    const params = await props.params;
    if (!userId) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { isPublic } = await request.json();

    const [updatedTrip] = await db
      .update(trips)
      .set({ isPublic })
      .where(and(eq(trips.id, params.id), eq(trips.userId, userId)))
      .returning();

    if (!updatedTrip) {
      return NextResponse.json({ success: false, error: "Trip not found or unauthorized" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: updatedTrip });
  } catch (error) {
    console.error("Error updating trip visibility:", error);
    return NextResponse.json({ success: false, error: "Failed to update visibility" }, { status: 500 });
  }
}
