import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/db";
import { trips, tripDays, activities } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function POST(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    const params = await props.params;
    if (!userId) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    // 1. Fetch the original trip
    const originalTrip = await db.query.trips.findFirst({
      where: eq(trips.id, params.id),
      with: {
        tripDays: {
          with: { activities: true }
        }
      }
    });

    if (!originalTrip) {
      return NextResponse.json({ success: false, error: "Trip not found" }, { status: 404 });
    }

    if (!originalTrip.isPublic && originalTrip.userId !== userId) {
      return NextResponse.json({ success: false, error: "Cannot clone private trip" }, { status: 403 });
    }

    // 2. Clone the main trip row
    const [newTrip] = await db.insert(trips).values({
      userId,
      title: `Clone of ${originalTrip.title}`,
      origin: originalTrip.origin,
      destination: originalTrip.destination,
      startDate: originalTrip.startDate,
      endDate: originalTrip.endDate,
      travelers: originalTrip.travelers,
      budget: originalTrip.budget,
      currency: originalTrip.currency,
      travelStyle: originalTrip.travelStyle,
      transportPreference: originalTrip.transportPreference,
      hotelCategory: originalTrip.hotelCategory,
      foodPreference: originalTrip.foodPreference,
      status: "planned",
      isPublic: false, // cloned trips are private by default
    }).returning();

    // 3. Clone Days and Activities
    for (const originalDay of originalTrip.tripDays) {
      const [newDay] = await db.insert(tripDays).values({
        tripId: newTrip.id,
        dayNumber: originalDay.dayNumber,
        date: originalDay.date,
      }).returning();

      if (originalDay.activities.length > 0) {
        const activitiesToInsert = originalDay.activities.map(act => ({
          tripDayId: newDay.id,
          time: act.time,
          name: act.name,
          location: act.location,
          description: act.description,
          duration: act.duration,
          estimatedCost: act.estimatedCost,
          currency: act.currency,
          category: act.category,
          imageUrl: act.imageUrl,
          travelTime: act.travelTime,
          lat: act.lat,
          lng: act.lng,
          rating: act.rating,
          isHiddenGem: act.isHiddenGem,
          localTip: act.localTip,
          bestTimeToVisit: act.bestTimeToVisit,
          orderIndex: act.orderIndex,
        }));
        await db.insert(activities).values(activitiesToInsert);
      }
    }

    return NextResponse.json({ success: true, data: { id: newTrip.id } });
  } catch (error) {
    console.error("Error cloning trip:", error);
    return NextResponse.json({ success: false, error: "Failed to clone trip" }, { status: 500 });
  }
}
