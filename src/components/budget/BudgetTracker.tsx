"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useSocket } from "@/hooks/useSocket";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Wallet, 
  Plane, 
  Hotel, 
  Utensils, 
  Ticket, 
  ShoppingBag, 
  Users,
  Plus
} from "lucide-react";

const CATEGORY_COLORS: Record<string, string> = {
  Flight: "bg-blue-500",
  Hotel: "bg-purple-500",
  Food: "bg-orange-500",
  Activity: "bg-green-500",
  Shopping: "bg-pink-500",
  Other: "bg-gray-500",
};

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  Flight: <Plane className="h-4 w-4" />,
  Hotel: <Hotel className="h-4 w-4" />,
  Food: <Utensils className="h-4 w-4" />,
  Activity: <Ticket className="h-4 w-4" />,
  Shopping: <ShoppingBag className="h-4 w-4" />,
  Other: <Wallet className="h-4 w-4" />,
};

interface Expense {
  id: string;
  amount: number;
  category: string;
  description: string;
  payerName?: string;
}

interface BudgetTrackerProps {
  tripId: string;
  totalBudget: number;
  currency: string;
  travelers: number;
  initialExpenses?: Expense[];
}

export function BudgetTracker({ 
  tripId,
  totalBudget, 
  currency = "USD", 
  travelers = 1,
  initialExpenses = [] 
}: BudgetTrackerProps) {
  const [expenses, setExpenses] = useState<Expense[]>(initialExpenses);
  const { emit, subscribe, collaborators } = useSocket(tripId);
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    const unsubscribe = subscribe("expense_added", (newExpense: Expense) => {
      setExpenses((prev) => [newExpense, ...prev]);
    });

    return () => unsubscribe();
  }, [subscribe]);
  
  // New Expense Form State
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("Food");
  const [description, setDescription] = useState("");

  const totalSpent = useMemo(() => {
    return expenses.reduce((sum, exp) => sum + Number(exp.amount), 0);
  }, [expenses]);

  const remainingBudget = totalBudget - totalSpent;
  const percentageSpent = Math.min((totalSpent / totalBudget) * 100, 100);
  const perPersonSplit = totalSpent / Math.max(1, travelers);

  const expensesByCategory = useMemo(() => {
    const grouped = expenses.reduce((acc, exp) => {
      acc[exp.category] = (acc[exp.category] || 0) + Number(exp.amount);
      return acc;
    }, {} as Record<string, number>);
    
    return Object.entries(grouped)
      .sort((a, b) => b[1] - a[1]) // Sort by amount descending
      .map(([cat, amt]) => ({
        category: cat,
        amount: amt,
        percentage: (amt / totalSpent) * 100
      }));
  }, [expenses, totalSpent]);

  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !description) return;

    const newExpense: Expense = {
      id: Math.random().toString(), // temporary ID
      amount: parseFloat(amount),
      category,
      description,
      payerName: "You", // Defaulting for now
    };

    setExpenses([newExpense, ...expenses]);
    setAmount("");
    setDescription("");
    setIsAdding(false);

    // Broadcast the new expense
    emit("expense_added", newExpense);
  };

  const formatMoney = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Top Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-6 bg-gradient-to-br from-primary/10 to-transparent border-primary/20">
          <p className="text-sm font-medium text-muted-foreground mb-1">Total Spent</p>
          <h3 className="text-3xl font-bold text-primary">{formatMoney(totalSpent)}</h3>
          <p className="text-xs text-muted-foreground mt-2">of {formatMoney(totalBudget)} budget</p>
        </Card>

        <Card className="p-6 glass">
          <p className="text-sm font-medium text-muted-foreground mb-1">Remaining</p>
          <h3 className={`text-3xl font-bold ${remainingBudget < 0 ? 'text-red-500' : 'text-foreground'}`}>
            {formatMoney(remainingBudget)}
          </h3>
          <p className="text-xs text-muted-foreground mt-2">
            {remainingBudget < 0 ? 'Over budget!' : 'On track'}
          </p>
        </Card>

        <Card className="p-6 glass">
          <div className="flex items-center justify-between mb-1">
            <p className="text-sm font-medium text-muted-foreground">Per Person Split</p>
            <Users className="h-4 w-4 text-muted-foreground" />
          </div>
          <h3 className="text-3xl font-bold text-foreground">{formatMoney(perPersonSplit)}</h3>
          <p className="text-xs text-muted-foreground mt-2">based on {travelers} travelers</p>
        </Card>
      </div>

      {/* Visual Progress Bar */}
      <Card className="p-6 glass">
        <h4 className="font-medium mb-4">Budget Usage</h4>
        <div className="h-4 w-full bg-muted rounded-full overflow-hidden flex">
          {expensesByCategory.map((cat) => (
            <div 
              key={cat.category}
              style={{ width: `${(cat.amount / totalBudget) * 100}%` }}
              className={`h-full ${CATEGORY_COLORS[cat.category] || CATEGORY_COLORS.Other} hover:opacity-80 transition-opacity cursor-pointer`}
              title={`${cat.category}: ${formatMoney(cat.amount)}`}
            />
          ))}
        </div>
        
        {/* Category Legend */}
        <div className="flex flex-wrap gap-4 mt-4">
          {expensesByCategory.map((cat) => (
            <div key={cat.category} className="flex items-center gap-2 text-sm">
              <div className={`w-3 h-3 rounded-full ${CATEGORY_COLORS[cat.category] || CATEGORY_COLORS.Other}`} />
              <span className="text-muted-foreground">{cat.category}</span>
              <span className="font-medium">{formatMoney(cat.amount)}</span>
            </div>
          ))}
        </div>
      </Card>

      {/* Expenses List & Add Form */}
      <Card className="p-6 glass border-border/50">
        <div className="flex items-center justify-between mb-6">
          <h4 className="font-semibold text-lg">Recent Expenses</h4>
          <Button onClick={() => setIsAdding(!isAdding)} variant="outline" size="sm" className="gap-2">
            <Plus className="h-4 w-4" /> Add Expense
          </Button>
        </div>

        {isAdding && (
          <form onSubmit={handleAddExpense} className="mb-6 p-4 bg-muted/30 rounded-xl border border-border/50 flex flex-col md:flex-row gap-3">
            <Input 
              placeholder="Description (e.g. Dinner at Luigi's)" 
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="md:flex-1"
              required
            />
            <div className="flex gap-3">
              <select 
                className="px-3 py-2 rounded-md border border-input bg-background text-sm focus:ring-2 focus:ring-primary outline-none"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                {Object.keys(CATEGORY_ICONS).map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              <Input 
                type="number" 
                placeholder="Amount" 
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-32"
                min="0"
                step="0.01"
                required
              />
              <Button type="submit">Save</Button>
            </div>
          </form>
        )}

        {expenses.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No expenses logged yet. Add your first one!
          </div>
        ) : (
          <div className="space-y-3">
            {expenses.map((expense) => (
              <div key={expense.id} className="flex items-center justify-between p-4 rounded-xl hover:bg-muted/50 transition-colors border border-transparent hover:border-border/50">
                <div className="flex items-center gap-4">
                  <div className={`p-2 rounded-lg text-white ${CATEGORY_COLORS[expense.category] || CATEGORY_COLORS.Other}`}>
                    {CATEGORY_ICONS[expense.category] || CATEGORY_ICONS.Other}
                  </div>
                  <div>
                    <h5 className="font-medium">{expense.description}</h5>
                    <p className="text-xs text-muted-foreground">Paid by {expense.payerName}</p>
                  </div>
                </div>
                <div className="font-semibold">
                  {formatMoney(expense.amount)}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
