"use client";
import { useState } from "react";
import { BudgetOverview } from "@/components/budget/BudgetOverview";
import { BudgetBreakdown } from "@/components/budget/BudgetBreakdown";
import { SplitBillCalculator } from "@/components/budget/SplitBillCalculator";
import { BudgetOptimizer } from "@/components/budget/BudgetOptimizer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Receipt, Search, Users } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import { EXPENSE_CATEGORIES } from "@/lib/constants";
import { SplitExpenseModal } from "@/components/expenses/SplitExpenseModal";

// Mock Data
const MOCK_TOTAL_BUDGET = 50000;
const MOCK_EXPENSES = [
  {
    id: "1",
    title: "Flight to Bali",
    category: "Transport",
    amount: 18000,
    date: "2026-08-01T10:00:00Z",
  },
  {
    id: "2",
    title: "Villa Stay (3 nights)",
    category: "Hotel",
    amount: 15000,
    date: "2026-08-01T14:00:00Z",
  },
  {
    id: "3",
    title: "Seafood Dinner",
    category: "Food",
    amount: 2500,
    date: "2026-08-01T20:00:00Z",
  },
  {
    id: "4",
    title: "Scuba Diving",
    category: "Entertainment",
    amount: 4500,
    date: "2026-08-02T09:00:00Z",
  },
  {
    id: "5",
    title: "Souvenirs",
    category: "Shopping",
    amount: 1200,
    date: "2026-08-03T16:00:00Z",
  },
];

export default function ExpenseTrackerPage() {
  const [search, setSearch] = useState("");
  const [isSplitModalOpen, setIsSplitModalOpen] = useState(false);
  const [selectedExpenseForSplit, setSelectedExpenseForSplit] =
    useState<any>(null);

  // Mock collaborators for demo
  const mockCollaborators = [
    {
      id: "user1",
      name: "You (Alex)",
      avatar: "https://i.pravatar.cc/150?u=user1",
    },
    { id: "user2", name: "Sarah", avatar: "https://i.pravatar.cc/150?u=user2" },
    { id: "user3", name: "Mike", avatar: "https://i.pravatar.cc/150?u=user3" },
  ];

  const totalSpent = MOCK_EXPENSES.reduce((sum, exp) => sum + exp.amount, 0);

  // Group data for chart
  const chartData = Object.entries(
    MOCK_EXPENSES.reduce(
      (acc, exp) => {
        acc[exp.category] = (acc[exp.category] || 0) + exp.amount;
        return acc;
      },
      {} as Record<string, number>,
    ),
  ).map(([name, value]) => ({ name, value, color: "" }));

  const filteredExpenses = MOCK_EXPENSES.filter(
    (exp) =>
      exp.title.toLowerCase().includes(search.toLowerCase()) ||
      exp.category.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="container mx-auto px-4 py-8 mt-20 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Expense Tracker</h1>
          <p className="text-muted-foreground">
            Manage and track your trip budget.
          </p>
        </div>
        <Button variant="gradient" className="gap-2">
          <Plus className="h-4 w-4" /> Add Expense
        </Button>
      </div>

      <div className="mb-8">
        <BudgetOptimizer />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        <div className="lg:col-span-2">
          <BudgetOverview
            totalBudget={MOCK_TOTAL_BUDGET}
            totalSpent={totalSpent}
          />
        </div>
        <div className="space-y-8">
          <BudgetBreakdown data={chartData} />
          <SplitBillCalculator />
        </div>
      </div>

      <Card>
        <CardHeader className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
          <CardTitle className="text-xl flex items-center gap-2">
            <Receipt className="h-5 w-5 text-primary" />
            Recent Transactions
          </CardTitle>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search expenses..."
              className="pl-9 bg-muted/50 border-none"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredExpenses.length > 0 ? (
              filteredExpenses.map((expense) => {
                const catInfo = EXPENSE_CATEGORIES.find(
                  (c) => c.label === expense.category,
                );
                return (
                  <div
                    key={expense.id}
                    className="flex items-center justify-between p-4 rounded-xl border bg-card hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className="h-12 w-12 rounded-full flex items-center justify-center text-xl shadow-sm"
                        style={{
                          backgroundColor: `${catInfo?.color}15`,
                          color: catInfo?.color,
                        }}
                      >
                        {catInfo?.icon || "📦"}
                      </div>
                      <div>
                        <h4 className="font-semibold text-foreground">
                          {expense.title}
                        </h4>
                        <div className="flex items-center text-xs text-muted-foreground gap-2 mt-1">
                          <span className="font-medium px-2 py-0.5 rounded-full bg-muted">
                            {expense.category}
                          </span>
                          <span>•</span>
                          <span>{formatDate(expense.date)}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right flex flex-col items-end justify-center">
                      <p className="font-bold text-lg">
                        {formatCurrency(expense.amount)}
                      </p>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 text-xs text-muted-foreground mt-1 gap-1"
                        onClick={() => {
                          setSelectedExpenseForSplit(expense);
                          setIsSplitModalOpen(true);
                        }}
                      >
                        <Users className="h-3 w-3" /> Split
                      </Button>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                No expenses found matching "{search}"
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {selectedExpenseForSplit && (
        <SplitExpenseModal
          isOpen={isSplitModalOpen}
          onClose={() => {
            setIsSplitModalOpen(false);
            setSelectedExpenseForSplit(null);
          }}
          totalAmount={selectedExpenseForSplit.amount}
          collaborators={mockCollaborators}
          onSave={(splits, type) => {
            console.log("Saved splits:", splits, type);
            alert("Expense split saved successfully!");
          }}
        />
      )}
    </div>
  );
}
