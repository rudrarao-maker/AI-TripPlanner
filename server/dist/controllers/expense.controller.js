"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addExpense = exports.getExpenses = void 0;
const response_1 = require("../utils/response");
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const getExpenses = async (req, res) => {
    try {
        const tripId = req.params.tripId;
        if (!tripId) {
            return (0, response_1.sendError)(res, 400, "tripId is required");
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
        (0, response_1.sendSuccess)(res, 200, expenses);
    }
    catch (error) {
        console.error("[Expense] Failed to get expenses:", error);
        (0, response_1.sendError)(res, 500, "Failed to fetch expenses");
    }
};
exports.getExpenses = getExpenses;
const addExpense = async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId)
            return (0, response_1.sendError)(res, 401, "Unauthorized");
        const { tripId, category, amount, currency, description, splitType, splits, } = req.body;
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
                    data: splits.map((s) => ({
                        expenseId: expense.id,
                        userId: s.userId,
                        amount: s.amount,
                        status: s.userId === userId ? "settled" : "pending", // Paid by creator is automatically settled
                    })),
                });
            }
            return expense;
        });
        (0, response_1.sendSuccess)(res, 201, newExpense, "Expense added successfully");
    }
    catch (error) {
        console.error("[Expense] Failed to create expense:", error);
        (0, response_1.sendError)(res, 500, "Failed to create expense");
    }
};
exports.addExpense = addExpense;
