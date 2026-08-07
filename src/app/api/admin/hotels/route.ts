import { NextResponse } from "next/server";
import { db } from "@/db";
import { hotels } from "@/db/schema";
import { withAdminAuth } from "@/lib/adminAuth";
import { desc, ilike } from "drizzle-orm";

async function getHotelsHandler(req: Request) {
  const url = new URL(req.url);
  const search = url.searchParams.get("search") || "";
  
  let conditions = undefined;
  if (search) {
    conditions = ilike(hotels.name, `%${search}%`);
  }
  
  const allHotels = await db.query.hotels.findMany({
    where: conditions,
    orderBy: [desc(hotels.createdAt)],
  });

  return NextResponse.json({ success: true, data: { hotels: allHotels } });
}

async function createHotelHandler(req: Request) {
  const body = await req.json();
  const newHotel = await db.insert(hotels).values({
    destinationId: body.destinationId,
    name: body.name,
    address: body.address,
    rating: String(body.rating),
    pricePerNight: String(body.pricePerNight),
    status: body.status,
  }).returning();

  return NextResponse.json({ success: true, data: newHotel[0] });
}

export const GET = (req: Request, ctx: any) => withAdminAuth(getHotelsHandler, "FETCH_HOTELS")(req, ctx);
export const POST = (req: Request, ctx: any) => withAdminAuth(createHotelHandler, "CREATE_HOTEL")(req, ctx);
