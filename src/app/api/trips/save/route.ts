import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/db";
import { trips, tripDays, activities } from "@/db/schema";
import { validateInput, TripSaveSchema } from "@/lib/validation";
import { applyRateLimit, tripSaveLimit } from "@/lib/apiRateLimit";
import { logger } from "@/lib/logger";

export async function POST(req: Request) {
  const start = Date.now();
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Rate limiting
    const rateResult = await applyRateLimit(tripSaveLimit, `save:${userId}`);
    if (!rateResult.allowed) {
      logger.warn("Trip save rate limited", { userId });
      return NextResponse.json(
        { error: "Rate limit exceeded. Please try again later." },
        { status: 429, headers: rateResult.headers }
      );
    }

    // Input validation
    const body = await req.json();
    const validation = validateInput(TripSaveSchema, body);
    if (!validation.success) {
      logger.warn("Trip save validation failed", { userId, errors: validation.errors });
      return NextResponse.json(
        { error: "Invalid input", details: validation.errors },
        { status: 400 }
      );
    }

    const { tripData, preferences } = validation.data;

    // 1. Save Trip
    const [insertedTrip] = await db.insert(trips).values({
      userId: userId,
      title: tripData.title,
      origin: tripData.origin || preferences?.origin || "",
      destination: tripData.destination || preferences?.destination || "",
      startDate: new Date(tripData.startDate),
      endDate: new Date(tripData.endDate),
      budget: tripData.budget.toString(),
      currency: tripData.currency || "INR",
      travelStyle: preferences?.travelStyle || "Comfort",
      transportPreference: preferences?.transportPreference || "Mixed",
      hotelCategory: preferences?.hotelCategory || "Standard",
      foodPreference: preferences?.foodPreference || "Any",
      status: "planned"
    }).returning();

    // 2. Save Days and Activities via Bulk Insert
    if (tripData.days && tripData.days.length > 0) {
      const daysToInsert = tripData.days.map((day) => ({
        tripId: insertedTrip.id,
        dayNumber: day.dayNumber,
        date: new Date(day.date || tripData.startDate)
      }));

      const insertedDays = await db.insert(tripDays).values(daysToInsert).returning();

      const allActivitiesToInsert: any[] = [];
      for (let i = 0; i < tripData.days.length; i++) {
        const day = tripData.days[i];
        const insertedDay = insertedDays[i];

        if (day.activities && day.activities.length > 0) {
          const activitiesArr = day.activities.map((act, idx) => ({
            tripDayId: insertedDay.id,
            time: act.time,
            name: act.name,
            location: act.location,
            description: act.description,
            category: act.category,
            estimatedCost: act.estimatedCost.toString(),
            currency: act.currency || "INR",
            orderIndex: idx
          }));
          allActivitiesToInsert.push(...activitiesArr);
        }
      }

      if (allActivitiesToInsert.length > 0) {
        await db.insert(activities).values(allActivitiesToInsert);
      }
    }

    logger.info("Trip saved successfully", { userId, tripId: insertedTrip.id, durationMs: Date.now() - start });
    return NextResponse.json({ success: true, data: { id: insertedTrip.id } });
  } catch (error: any) {
    logger.error("Trip Save Error", { error: error.message, stack: error.stack, durationMs: Date.now() - start });
    return NextResponse.json({ error: "Failed to save trip." }, { status: 500 });
  }
}
