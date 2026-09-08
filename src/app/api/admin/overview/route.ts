import { NextResponse } from 'next/server';
import { db } from '@/db';
import { users, trips, payments, partners } from '@/db/schema';
import { desc, count, sum, eq } from 'drizzle-orm';
import { withAdminAuth } from '@/lib/adminAuth';

async function getOverviewHandler() {
  try {
    // Fetch real metrics from Postgres
    const [totalUsers] = await db.select({ count: count() }).from(users);
    const [totalTrips] = await db.select({ count: count() }).from(trips);
    
    const [totalRevenueResult] = await db.select({ total: sum(payments.amount) })
      .from(payments)
      .where(eq(payments.status, "succeeded"));
      
    const totalRevenue = parseFloat(totalRevenueResult.total || "0");

    // Fetch the latest 5 signups
    const recentSignups = await db.query.users.findMany({
      orderBy: [desc(users.createdAt)],
      limit: 5
    });

    // Fetch pending partners
    const pendingPartners = await db.query.partners.findMany({
      where: eq(partners.status, "pending"),
      orderBy: [desc(partners.createdAt)],
      limit: 5
    });

    return NextResponse.json({
      success: true,
      data: {
        stats: {
          totalUsers: totalUsers.count,
          totalTrips: totalTrips.count,
          totalRevenue,
          serverLoad: Math.floor(Math.random() * 15) + 5, // Replace with actual metrics service like Datadog if available
        },
        recentSignups: recentSignups.map((u: any) => ({
          id: u.id,
          name: u.name,
          email: u.email,
          avatar: u.avatar,
          createdAt: u.createdAt
        })),
        pendingPartners: pendingPartners
      }
    });

  } catch (error) {
    console.error("Overview fetch error:", error);
    return NextResponse.json({ error: 'Failed to fetch overview metrics' }, { status: 500 });
  }
}

export const GET = (req: Request, ctx: any) => withAdminAuth(getOverviewHandler, "FETCH_OVERVIEW")(req, ctx);
