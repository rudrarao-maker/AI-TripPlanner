import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { category, action } = body; 
    // action is either "upvote" (+1) or "downvote" / "remove" (-1)

    // Find the user
    const userRecords = await db.select().from(users).where(eq(users.clerkId, userId));
    if (!userRecords.length) return NextResponse.json({ error: "User not found" }, { status: 404 });
    const user = userRecords[0];

    const prefs = (user.preferencesProfile as Record<string, number>) || {};
    const currentWeight = prefs[category] || 0;
    
    const modifier = action === "upvote" ? 1 : -1;
    prefs[category] = currentWeight + modifier;

    await db.update(users)
      .set({ preferencesProfile: prefs })
      .where(eq(users.id, user.id));

    return NextResponse.json({ success: true, preferencesProfile: prefs });
  } catch (error) {
    console.error("Error updating user preferences:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
