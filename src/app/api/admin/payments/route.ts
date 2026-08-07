import { NextResponse } from "next/server";
import { db } from "@/db";
import { payments } from "@/db/schema";
import { withAdminAuth } from "@/lib/adminAuth";
import { desc, ilike } from "drizzle-orm";

async function getPaymentsHandler(req: Request) {
  const url = new URL(req.url);
  const search = url.searchParams.get("search") || "";
  
  let conditions = undefined;
  if (search) {
    conditions = ilike(payments.stripeTransactionId, `%${search}%`);
  }

  const allPayments = await db.query.payments.findMany({
    where: conditions,
    with: {
      user: {
        columns: {
          name: true,
          email: true,
        }
      },
      booking: {
        columns: {
          type: true,
        }
      }
    },
    orderBy: [desc(payments.createdAt)],
    limit: 100
  });

  return NextResponse.json({ success: true, data: { payments: allPayments } });
}

export const GET = (req: Request, ctx: any) => withAdminAuth(getPaymentsHandler, "FETCH_PAYMENTS")(req, ctx);
