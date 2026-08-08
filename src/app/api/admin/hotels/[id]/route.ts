import { NextResponse } from "next/server";
import { db } from "@/db";
import { hotels } from "@/db/schema";
import { withAdminAuth } from "@/lib/adminAuth";
import { eq } from "drizzle-orm";

async function updateHotelHandler(req: Request, { params }: any) {
  const { id } = await params;
  const body = await req.json();
  
  const updated = await db.update(hotels)
    .set({
      destinationId: body.destinationId,
      name: body.name,
      address: body.address,
      rating: String(body.rating),
      price: String(body.pricePerNight),
    })
    .where(eq(hotels.id, id))
    .returning();

  return NextResponse.json({ success: true, data: updated[0] });
}

async function deleteHotelHandler(req: Request, { params }: any) {
  const { id } = await params;
  await db.delete(hotels).where(eq(hotels.id, id));
  return NextResponse.json({ success: true });
}

export const PUT = (req: Request, ctx: any) => withAdminAuth(updateHotelHandler, "UPDATE_HOTEL")(req, ctx);
export const DELETE = (req: Request, ctx: any) => withAdminAuth(deleteHotelHandler, "DELETE_HOTEL")(req, ctx);
