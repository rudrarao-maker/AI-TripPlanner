import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/db";
import { trips, tripDays, activities } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { validateInput, TripUpdateSchema } from "@/lib/validation";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const trip = await db.query.trips.findFirst({
      where: (trips, { eq, and }) => and(eq(trips.id, id), eq(trips.userId, userId)),
      with: {
        tripDays: {
          with: {
            activities: true,
          }
        }
      }
    });

    if (!trip) {
      return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: trip });
  } catch (error: any) {
    console.error("Fetch Trip Error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Verify trip ownership to prevent Broken Access Control
    const trip = await db.query.trips.findFirst({
      where: and(eq(trips.id, id), eq(trips.userId, userId)),
    });

    if (!trip) {
      return NextResponse.json({ error: "Forbidden or Not Found" }, { status: 403 });
    }

    const body = await req.json();
    const validation = validateInput(TripUpdateSchema, body);
    
    if (!validation.success) {
      return NextResponse.json({ error: "Invalid input", details: validation.errors }, { status: 400 });
    }

    const data = validation.data;

    if (data.activities) {
      for (const act of data.activities) {
        if (act.id) {
           await db.update(activities).set(act as any).where(eq(activities.id, act.id));
        } else {
           await db.insert(activities).values(act as any);
        }
      }
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Update Trip Error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
