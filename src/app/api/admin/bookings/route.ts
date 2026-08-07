import { NextResponse } from "next/server";
import { db } from "@/db";
import { bookings } from "@/db/schema";
import { withAdminAuth } from "@/lib/adminAuth";
import { desc } from "drizzle-orm";

async function getBookingsHandler(req: Request) {
  const allBookings = await db.query.bookings.findMany({
    with: {
      user: {
        columns: {
          id: true,
          name: true,
          email: true,
        }
      },
      trip: {
        columns: {
          title: true,
          destination: true,
        }
      }
    },
    orderBy: [desc(bookings.createdAt)],
    limit: 100
  });

  return NextResponse.json({ success: true, data: { bookings: allBookings } });
}

export const GET = (req: Request, ctx: any) => withAdminAuth(getBookingsHandler, "FETCH_BOOKINGS")(req, ctx);
