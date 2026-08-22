import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/db";
import { trips, tripDestinations } from "@/db/schema";
import { eq, and, asc } from "drizzle-orm";

export async function GET(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    const params = await props.params;
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const destinations = await db.query.tripDestinations.findMany({
      where: eq(tripDestinations.tripId, params.id),
      orderBy: [asc(tripDestinations.order)],
    });

    return NextResponse.json({ success: true, data: destinations });
  } catch (error) {
    console.error("Error fetching destinations:", error);
    return NextResponse.json({ error: "Failed to fetch destinations" }, { status: 500 });
  }
}

export async function POST(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    const params = await props.params;
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // Verify trip ownership
    const trip = await db.query.trips.findFirst({
      where: and(eq(trips.id, params.id), eq(trips.userId, userId)),
    });
    if (!trip) return NextResponse.json({ error: "Trip not found" }, { status: 404 });

    const body = await request.json();

    // Get current max order
    const existing = await db.query.tripDestinations.findMany({
      where: eq(tripDestinations.tripId, params.id),
      orderBy: [asc(tripDestinations.order)],
    });
    const nextOrder = existing.length > 0
      ? Math.max(...existing.map(d => d.order)) + 1
      : 1;

    const [newDest] = await db.insert(tripDestinations).values({
      tripId: params.id,
      name: body.name,
      country: body.country || null,
      state: body.state || null,
      order: body.order ?? nextOrder,
      numberOfDays: body.numberOfDays || 2,
      lat: body.lat || null,
      lng: body.lng || null,
      customPreferences: body.customPreferences || null,
    }).returning();

    return NextResponse.json({ success: true, data: newDest }, { status: 201 });
  } catch (error) {
    console.error("Error adding destination:", error);
    return NextResponse.json({ error: "Failed to add destination" }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    const params = await props.params;
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const trip = await db.query.trips.findFirst({
      where: and(eq(trips.id, params.id), eq(trips.userId, userId)),
    });
    if (!trip) return NextResponse.json({ error: "Trip not found" }, { status: 404 });

    const body = await request.json();

    // Support batch reorder: { destinations: [{ id, order, numberOfDays?, ... }] }
    if (body.destinations && Array.isArray(body.destinations)) {
      for (const dest of body.destinations) {
        const updateData: any = {};
        if (dest.order != null) updateData.order = dest.order;
        if (dest.numberOfDays != null) updateData.numberOfDays = dest.numberOfDays;
        if (dest.customPreferences !== undefined) updateData.customPreferences = dest.customPreferences;
        if (dest.startDate) updateData.startDate = new Date(dest.startDate);
        if (dest.endDate) updateData.endDate = new Date(dest.endDate);
        if (dest.transportToNext !== undefined) updateData.transportToNext = dest.transportToNext;
        updateData.updatedAt = new Date();

        await db.update(tripDestinations)
          .set(updateData)
          .where(and(
            eq(tripDestinations.id, dest.id),
            eq(tripDestinations.tripId, params.id),
          ));
      }

      const updated = await db.query.tripDestinations.findMany({
        where: eq(tripDestinations.tripId, params.id),
        orderBy: [asc(tripDestinations.order)],
      });

      return NextResponse.json({ success: true, data: updated });
    }

    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  } catch (error) {
    console.error("Error updating destinations:", error);
    return NextResponse.json({ error: "Failed to update destinations" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    const params = await props.params;
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const trip = await db.query.trips.findFirst({
      where: and(eq(trips.id, params.id), eq(trips.userId, userId)),
    });
    if (!trip) return NextResponse.json({ error: "Trip not found" }, { status: 404 });

    const { destinationId } = await request.json();
    if (!destinationId) return NextResponse.json({ error: "destinationId required" }, { status: 400 });

    await db.delete(tripDestinations).where(
      and(
        eq(tripDestinations.id, destinationId),
        eq(tripDestinations.tripId, params.id),
      )
    );

    // Re-order remaining destinations
    const remaining = await db.query.tripDestinations.findMany({
      where: eq(tripDestinations.tripId, params.id),
      orderBy: [asc(tripDestinations.order)],
    });
    for (let i = 0; i < remaining.length; i++) {
      await db.update(tripDestinations)
        .set({ order: i + 1, updatedAt: new Date() })
        .where(eq(tripDestinations.id, remaining[i].id));
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting destination:", error);
    return NextResponse.json({ error: "Failed to delete destination" }, { status: 500 });
  }
}
