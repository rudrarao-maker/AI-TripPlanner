import { NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { db } from '@/db';
import { users } from '@/db/schema';

export async function POST() {
  const user = await currentUser();
  
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const email = user.emailAddresses[0]?.emailAddress;
  const fullName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Traveler';

  if (!email) {
    return NextResponse.json({ error: 'No email found' }, { status: 400 });
  }

  try {
    await db.insert(users).values({
      clerkId: user.id,
      email,
      name: fullName,
      avatar: user.imageUrl,
    }).onConflictDoNothing({ target: users.email });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Failed to sync user on login:', err);
    return NextResponse.json({ error: 'Failed to sync' }, { status: 500 });
  }
}
