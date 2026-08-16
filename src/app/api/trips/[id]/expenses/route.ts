import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/db";
import { expenses, expenseSplits, trips, users } from "@/db/schema";
import { eq, and, desc } from "drizzle-orm";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = auth();
    if (!userId) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

    const tripExpenses = await db.query.expenses.findMany({
      where: eq(expenses.tripId, params.id),
      with: {
        user: true, // who paid
        splits: {
          with: {
            user: true // who owes
          }
        }
      },
      orderBy: [desc(expenses.createdAt)]
    });

    return NextResponse.json({ success: true, data: tripExpenses });
  } catch (error) {
    console.error("Error fetching expenses:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch expenses" }, { status: 500 });
  }
}

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { userId: currentUserId } = auth();
    if (!currentUserId) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

    // Validate the trip exists and user has access (simplified for now)
    const trip = await db.query.trips.findFirst({ where: eq(trips.id, params.id) });
    if (!trip) return NextResponse.json({ success: false, error: "Trip not found" }, { status: 404 });

    const body = await request.json();
    const { amount, currency = "INR", category, description, date, userId, splits } = body;

    // Use a transaction since we are inserting into multiple tables
    const newExpenseId = await db.transaction(async (tx) => {
      const [newExpense] = await tx.insert(expenses).values({
        tripId: params.id,
        userId: userId || currentUserId,
        amount,
        currency,
        category,
        description,
        date: new Date(date),
      }).returning({ id: expenses.id });

      if (splits && splits.length > 0) {
        await tx.insert(expenseSplits).values(
          splits.map((s: any) => ({
            expenseId: newExpense.id,
            userId: s.userId,
            amount: s.amount
          }))
        );
      }

      return newExpense.id;
    });

    // Fetch the fully populated inserted expense
    const expenseWithUser = await db.query.expenses.findFirst({
      where: eq(expenses.id, newExpenseId),
      with: { 
        user: true,
        splits: { with: { user: true } }
      }
    });

    return NextResponse.json({ success: true, data: expenseWithUser });
  } catch (error) {
    console.error("Error creating expense:", error);
    return NextResponse.json({ success: false, error: "Failed to create expense" }, { status: 500 });
  }
}
