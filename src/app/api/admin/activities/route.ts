import { NextResponse } from "next/server";
import { db } from "@/db";
import { activities } from "@/db/schema";
import { withAdminAuth } from "@/lib/adminAuth";
import { desc, ilike, or } from "drizzle-orm";

async function getActivitiesHandler(req: Request) {
  const url = new URL(req.url);
  const search = url.searchParams.get("search") || "";
  
  let conditions = undefined;
  if (search) {
    conditions = or(
      ilike(activities.name, `%${search}%`),
      ilike(activities.location, `%${search}%`)
    );
  }
  
  const allActivities = await db.query.activities.findMany({
    where: conditions,
    orderBy: [desc(activities.createdAt)],
    limit: 100
  });

  return NextResponse.json({ success: true, data: { activities: allActivities } });
}

export const GET = (req: Request, ctx: any) => withAdminAuth(getActivitiesHandler, "FETCH_ACTIVITIES")(req, ctx);
