import { NextResponse } from 'next/server';
import { db } from '@/db';
import { partners } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { withAdminAuth } from '@/lib/adminAuth';

async function updatePartnerStatusHandler(req: Request) {
  try {
    const body = await req.json();
    const { partnerId, status } = body;

    if (!partnerId || !status) {
      return NextResponse.json({ error: 'Missing partnerId or status' }, { status: 400 });
    }

    if (!['approved', 'rejected'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    // Update partner status
    await db.update(partners)
      .set({ status, updatedAt: new Date() })
      .where(eq(partners.id, partnerId));

    return NextResponse.json({ success: true, message: `Partner ${status} successfully.` });
  } catch (error) {
    console.error("Partner status update error:", error);
    return NextResponse.json({ error: 'Failed to update partner status' }, { status: 500 });
  }
}

export const POST = (req: Request, ctx: any) => withAdminAuth(updatePartnerStatusHandler, "UPDATE_PARTNER")(req, ctx);
