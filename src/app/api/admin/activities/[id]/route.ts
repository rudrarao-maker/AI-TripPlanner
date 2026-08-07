import { NextResponse } from "next/server";
import { db } from "@/db";
import { activities } from "@/db/schema";
import { withAdminAuth } from "@/lib/adminAuth";
import { eq } from "drizzle-orm";

async function deleteActivityHandler(req: Request, { params }: any) {
  const { id } = await params;
  await db.delete(activities).where(eq(activities.id, id));
  return NextResponse.json({ success: true });
}

export const DELETE = (req: Request, ctx: any) => withAdminAuth(deleteActivityHandler, "DELETE_ACTIVITY")(req, ctx);
