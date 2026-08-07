import { NextResponse } from "next/server";
import { db } from "@/db";
import { destinations } from "@/db/schema";
import { withAdminAuth } from "@/lib/adminAuth";
import { desc, ilike, or } from "drizzle-orm";

async function getDestinationsHandler(req: Request) {
  const url = new URL(req.url);
  const search = url.searchParams.get("search") || "";
  
  let conditions = undefined;
  if (search) {
    conditions = or(
      ilike(destinations.name, `%${search}%`),
      ilike(destinations.country, `%${search}%`)
    );
  }
  
  const allDestinations = await db.query.destinations.findMany({
    where: conditions,
    orderBy: [desc(destinations.createdAt)],
  });

  return NextResponse.json({ success: true, data: { destinations: allDestinations } });
}

async function createDestinationHandler(req: Request) {
  const body = await req.json();
  const newDest = await db.insert(destinations).values({
    name: body.name,
    country: body.country,
    state: body.state,
    city: body.city,
    description: body.description,
    status: body.status,
  }).returning();

  return NextResponse.json({ success: true, data: newDest[0] });
}

export const GET = (req: Request, ctx: any) => withAdminAuth(getDestinationsHandler, "FETCH_DESTINATIONS")(req, ctx);
export const POST = (req: Request, ctx: any) => withAdminAuth(createDestinationHandler, "CREATE_DESTINATION")(req, ctx);
