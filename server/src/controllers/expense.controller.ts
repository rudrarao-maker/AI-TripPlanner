import { Request, Response } from "express";
import { sendSuccess, sendError } from "../utils/response";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const getExpenses = async (req: Request, res: Response) => {
  try {
    const tripId = req.params.tripId as string;
    if (!tripId) {
      return sendError(res, 400, "tripId is required");
    }

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
  } catch (error) {
    console.error("[Expense] Failed to get expenses:", error);
    sendError(res, 500, "Failed to fetch expenses");
  }
};

export const addExpense = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) return sendError(res, 401, "Unauthorized");

    const {
      tripId,
      category,
      amount,
      currency,
      description,
      splitType,
      splits,
    } = req.body;

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
          data: splits.map((s: any) => ({
            expenseId: expense.id,
            userId: s.userId,
            amount: s.amount,
            status: s.userId === userId ? "settled" : "pending", // Paid by creator is automatically settled
          })),
        });
      }

      return expense;
    });

    sendSuccess(res, 201, newExpense, "Expense added successfully");
  } catch (error) {
    console.error("[Expense] Failed to create expense:", error);
    sendError(res, 500, "Failed to create expense");
  }
};
