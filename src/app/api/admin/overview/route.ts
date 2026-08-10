import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/db';
import { users, trips } from '@/db/schema';
import { desc, count, eq } from 'drizzle-orm';

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify admin role
    const user = await db.query.users.findFirst({
      where: eq(users.clerkId, userId)
    });
    
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden. Admin access required.' }, { status: 403 });
    }

    // Fetch real metrics from Postgres
    const [totalUsers] = await db.select({ count: count() }).from(users);
    const [totalTrips] = await db.select({ count: count() }).from(trips);

    // Fetch the latest 5 signups
    const recentSignups = await db.query.users.findMany({
      orderBy: [desc(users.createdAt)],
      limit: 5
    });

    return NextResponse.json({
      success: true,
      data: {
        stats: {
          totalUsers: totalUsers.count,
          totalTrips: totalTrips.count,
          totalRevenue: 0, // Placeholder until payments are integrated
          serverLoad: Math.floor(Math.random() * 40) + 10, // Simulated server load
        },
        recentSignups: recentSignups.map((u: any) => ({
          id: u.id,
          name: u.name,
          email: u.email,
          avatar: u.avatar,
          createdAt: u.createdAt
        }))
      }
    });

  } catch (error) {
    console.error("Overview fetch error:", error);
    return NextResponse.json({ error: 'Failed to fetch overview metrics' }, { status: 500 });
  }
}
