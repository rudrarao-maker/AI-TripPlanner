import { NextResponse } from 'next/server';
import { db } from '@/db';
import { trips, users } from '@/db/schema';
import { eq, and, sql } from 'drizzle-orm';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY || 're_dummy_123');

export async function GET(req: Request) {
  try {
    // Verify auth header if using Vercel Cron
    const authHeader = req.headers.get('authorization');
    if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Find trips starting exactly in 3 days
    // using PostgreSQL interval logic or simple JS dates
    const threeDaysFromNowStart = new Date();
    threeDaysFromNowStart.setDate(threeDaysFromNowStart.getDate() + 3);
    threeDaysFromNowStart.setHours(0, 0, 0, 0);

    const threeDaysFromNowEnd = new Date(threeDaysFromNowStart);
    threeDaysFromNowEnd.setHours(23, 59, 59, 999);

    const upcomingTrips = await db.select({
      trip: trips,
      user: users
    })
    .from(trips)
    .innerJoin(users, eq(trips.userId, users.id))
    .where(
      and(
        sql`${trips.startDate} >= ${threeDaysFromNowStart}`,
        sql`${trips.startDate} <= ${threeDaysFromNowEnd}`
      )
    );

    const results = [];

    for (const record of upcomingTrips) {
      const { trip, user } = record;
      if (!user.email) continue;

      const htmlContent = `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background-color: #f9fafb; padding: 20px; border-radius: 12px;">
          <div style="text-align: center; margin-bottom: 20px;">
            <h1 style="color: #f59e0b; margin: 0;">AI TripPlanner</h1>
            <p style="color: #6b7280; font-size: 16px;">Your adventure is almost here!</p>
          </div>
          <div style="background-color: white; padding: 24px; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
            <h2 style="margin-top: 0;">Hi ${user.name},</h2>
            <p>You're leaving for <strong>${trip.destination}</strong> in just 3 days! ✈️</p>
            <p>Make sure you've checked off the essentials:</p>
            <ul>
              <li>Passport & Visa (if applicable)</li>
              <li>Travel Insurance</li>
              <li>Phone Charger & Universal Adapter</li>
              <li>Medications</li>
            </ul>
            <div style="margin-top: 30px; text-align: center;">
              <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/trip-planner?id=${trip.id}" style="background-color: #f59e0b; color: white; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: bold;">View Full Itinerary & Packing List</a>
            </div>
          </div>
          <div style="text-align: center; margin-top: 20px; color: #9ca3af; font-size: 12px;">
            <p>Happy Travels,<br/>The AI TripPlanner Team</p>
          </div>
        </div>
      `;

      try {
        const { data, error } = await resend.emails.send({
          from: 'TripPlanner <hello@trip-planner.com>',
          to: user.email,
          subject: `✈️ Only 3 days until ${trip.destination}!`,
          html: htmlContent,
        });

        if (error) {
          console.error('Failed to send email to', user.email, error);
          results.push({ email: user.email, success: false, error });
        } else {
          results.push({ email: user.email, success: true, id: data?.id });
        }
      } catch (err) {
        console.error('Exception sending email to', user.email, err);
        results.push({ email: user.email, success: false, error: err });
      }
    }

    return NextResponse.json({ 
      success: true, 
      processed: upcomingTrips.length,
      results 
    });

  } catch (error: any) {
    console.error('Cron Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
