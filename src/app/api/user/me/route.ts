import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const userRecord = await db.query.users.findFirst({
      where: eq(users.clerkId, userId),
    });

    if (!userRecord) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    return NextResponse.json({ success: true, data: userRecord });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch user' }, { status: 500 });
  }
}
