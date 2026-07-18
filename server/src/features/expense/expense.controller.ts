import { Request, Response } from 'express';
import { sendSuccess } from '../../utils/response';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getExpenses = async (req: Request, res: Response) => {
  const tripId = req.params.tripId;
  // Mock data for Phase 5
  const expenses = [
    {
      id: '1',
      tripId,
      category: 'food',
      amount: 1500,
      currency: 'INR',
      description: 'Dinner at local restaurant',
      date: new Date().toISOString()
    }
  ];
  sendSuccess(res, 200, expenses);
};

export const addExpense = async (req: Request, res: Response) => {
  // Mock adding expense
  const newExpense = {
    id: Date.now().toString(),
    ...req.body,
    date: new Date().toISOString()
  };
  sendSuccess(res, 201, newExpense, 'Expense added successfully');
};
