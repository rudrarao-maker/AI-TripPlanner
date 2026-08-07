import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/db";
import { trips } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

export async function GET(req: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const tripsData = await db.select().from(trips).where(eq(trips.userId, userId)).orderBy(desc(trips.createdAt));

    return NextResponse.json({ success: true, data: tripsData });
  } catch (error: any) {
    console.error("Fetch Trips Error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
