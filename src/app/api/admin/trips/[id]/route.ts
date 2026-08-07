import { NextResponse } from "next/server";
import { db } from "@/db";
import { trips } from "@/db/schema";
import { withAdminAuth } from "@/lib/adminAuth";
import { eq } from "drizzle-orm";

async function deleteTripHandler(req: Request, { params }: any) {
  const { id } = await params;
  
  await db.delete(trips).where(eq(trips.id, id));

  return NextResponse.json({ success: true });
}

export const DELETE = (req: Request, ctx: any) => withAdminAuth(deleteTripHandler, "DELETE_TRIP")(req, ctx);
