import { NextResponse } from "next/server";
import { db } from "@/db";
import { trips } from "@/db/schema";
import { withAdminAuth } from "@/lib/adminAuth";
import { desc, or, ilike } from "drizzle-orm";

async function getTripsHandler(req: Request) {
  const url = new URL(req.url);
  const search = url.searchParams.get("search") || "";
  
  let conditions = undefined;
  
  if (search) {
    conditions = or(
      ilike(trips.title, `%${search}%`),
      ilike(trips.destination, `%${search}%`)
    );
  }
  
  const allTrips = await db.query.trips.findMany({
    where: conditions,
    orderBy: [desc(trips.createdAt)],
    limit: 50
  });

  return NextResponse.json({ 
    success: true, 
    data: { trips: allTrips }
  });
}

export const GET = (req: Request, ctx: any) => withAdminAuth(getTripsHandler, "FETCH_TRIPS")(req, ctx);
