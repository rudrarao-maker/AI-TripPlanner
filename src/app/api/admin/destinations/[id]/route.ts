import { NextResponse } from "next/server";
import { db } from "@/db";
import { destinations } from "@/db/schema";
import { withAdminAuth } from "@/lib/adminAuth";
import { eq } from "drizzle-orm";

async function updateDestinationHandler(req: Request, { params }: any) {
  const { id } = await params;
  const body = await req.json();
  
  const updated = await db.update(destinations)
    .set({
      name: body.name,
      country: body.country,
      state: body.state,
      city: body.city,
      description: body.description,
      status: body.status,
    })
    .where(eq(destinations.id, id))
    .returning();

  return NextResponse.json({ success: true, data: updated[0] });
}

async function deleteDestinationHandler(req: Request, { params }: any) {
  const { id } = await params;
  await db.delete(destinations).where(eq(destinations.id, id));
  return NextResponse.json({ success: true });
}

export const PUT = (req: Request, ctx: any) => withAdminAuth(updateDestinationHandler, "UPDATE_DESTINATION")(req, ctx);
export const DELETE = (req: Request, ctx: any) => withAdminAuth(deleteDestinationHandler, "DELETE_DESTINATION")(req, ctx);
