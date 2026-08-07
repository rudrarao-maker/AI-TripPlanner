import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/db";
import { trips, tripDays, activities } from "@/db/schema";
import { eq } from "drizzle-orm";

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
    const body = await req.json();

    if (body.activities) {
      for (const act of body.activities) {
        if (act.id) {
           await db.update(activities).set(act).where(eq(activities.id, act.id));
        } else {
           await db.insert(activities).values(act);
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
