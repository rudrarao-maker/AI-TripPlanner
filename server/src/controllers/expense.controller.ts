import { Request, Response } from "express";
import { sendSuccess, sendError } from "../utils/response";
import { catchAsync } from "../utils/catchAsync";
import { assertTripAccess, assertTripEditor } from "../middlewares/authMiddleware";
import prisma from "../utils/prisma";

/**
 * GET /expenses/:tripId
 * Requires trip membership (any role).
 */
export const getExpenses = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const tripId = req.params.tripId as string;

  if (!tripId) {
    return sendError(res, 400, "tripId is required");
  }

  // Verify user has access to this trip
  await assertTripAccess(userId, tripId);

  const expenses = await prisma.expense.findMany({
    where: { tripId },
    include: {
      splits: {
        include: { user: { select: { id: true, name: true, avatar: true } } },
      },
      user: { select: { id: true, name: true, avatar: true } },
    },
    orderBy: { date: "desc" },
  });

  sendSuccess(res, 200, expenses);
});

/**
 * POST /expenses
 * Requires trip editor access.
 */
export const addExpense = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user!.id;

  const {
    tripId,
    category,
    amount,
    currency,
    description,
    splitType,
    splits,
  } = req.body;

  if (!tripId || !category || amount == null || !description) {
    return sendError(res, 400, "Missing required fields: tripId, category, amount, description");
  }

  // Verify user can edit this trip
  await assertTripEditor(userId, tripId);

  const newExpense = await prisma.$transaction(async (tx) => {
    const expense = await tx.expense.create({
      data: {
        tripId,
        userId,
        category,
        amount,
        currency: currency || "INR",
        description,
        date: new Date(),
        splitType: splitType || "none",
      },
    });

    if (splits && Array.isArray(splits) && splits.length > 0) {
      await tx.expenseSplit.createMany({
        data: splits.map((s: { userId: string; amount: number }) => ({
          expenseId: expense.id,
          userId: s.userId,
          amount: s.amount,
          status: s.userId === userId ? "settled" : "pending",
        })),
      });
    }

    return expense;
  });

  sendSuccess(res, 201, newExpense, "Expense added successfully");
});
