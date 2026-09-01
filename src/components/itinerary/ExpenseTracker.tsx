"use client";
import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  IndianRupee,
  Plus,
  Receipt,
  User,
  ArrowRight,
  Wallet,
  Check,
  X,
  Users,
} from "lucide-react";
import { useGetExpenses, useAddExpense } from "@/hooks/useExpenses";
import { calculateBalances, simplifyDebts } from "@/lib/splitwise";
import type { ExpenseRecord, SplitUser } from "@/lib/splitwise";
import { useUser } from "@clerk/nextjs";
import { formatCurrency, formatDate } from "@/lib/utils";
import { toast } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import type { Collaborator } from "@/hooks/useSocket";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend } from "recharts";

export function ExpenseTracker({
  tripId,
  collaborators,
}: {
  tripId: string;
  collaborators: Collaborator[];
}) {
  const { user } = useUser();
  const { data: expenses = [], isLoading } = useGetExpenses(tripId);
  const addExpense = useAddExpense();

  const [isAdding, setIsAdding] = useState(false);
  const [newExpense, setNewExpense] = useState({
    description: "",
    amount: "",
    category: "Food",
    splitType: "equal",
    paidBy: user?.id || "",
  });

  // Combine current user with socket collaborators to get a full list of potential users
  const allUsers: SplitUser[] = useMemo(() => {
    const list: SplitUser[] = [];
    if (user) {
      list.push({ id: user.id, name: user.fullName || user.firstName || "Me", avatar: user.imageUrl });
    }
    collaborators.forEach((c) => {
      if (!list.find((u) => u.id === c.id)) {
        list.push({ id: c.id, name: c.name, avatar: c.avatar });
      }
    });
    return list;
  }, [user, collaborators]);

  const { balances, transactions } = useMemo(() => {
    // Map API expenses to our Splitwise algorithm format
    const records: ExpenseRecord[] = expenses.map((exp) => ({
      id: exp.id,
      payerId: exp.userId,
      amount: exp.amount,
      description: exp.description,
      splits: exp.splits.map((s) => ({ userId: s.userId, amount: s.amount })),
    }));

    const bals = calculateBalances(records, allUsers);
    const trans = simplifyDebts(bals);
    return { balances: bals, transactions: trans };
  }, [expenses, allUsers]);

  const handleAddExpense = async () => {
    if (!newExpense.description || !newExpense.amount || !newExpense.paidBy) {
      toast.error("Please fill in all required fields");
      return;
    }

    const amountNum = parseFloat(newExpense.amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    // Default to splitting equally among all known users
    const splitAmount = amountNum / allUsers.length;
    const splits = allUsers.map((u) => ({
      userId: u.id,
      amount: splitAmount,
    }));

    toast.loading("Adding expense...", { id: "add-exp" });
    try {
      await addExpense.mutateAsync({
        tripId,
        category: newExpense.category,
        amount: amountNum,
        currency: "INR",
        description: newExpense.description,
        splitType: newExpense.splitType,
        splits: splits,
      });
      toast.success("Expense added!", { id: "add-exp" });
      setIsAdding(false);
      setNewExpense({
        description: "",
        amount: "",
        category: "Food",
        splitType: "equal",
        paidBy: user?.id || "",
      });
    } catch (e) {
      console.error(e);
      toast.error("Failed to add expense", { id: "add-exp" });
    }
  };

  const getUserName = (id: string) => {
    return allUsers.find((u) => u.id === id)?.name || "Someone";
  };

  return (
    <div className="space-y-6">
      {/* Balances Overview */}
      <Card className="glass-card overflow-hidden">
        <CardHeader className="bg-muted/30 border-b pb-4">
          <div className="flex justify-between items-center">
            <CardTitle className="text-xl flex items-center gap-2">
              <Wallet className="h-5 w-5 text-primary" /> Balances
            </CardTitle>
            <Button
              size="sm"
              variant="gradient"
              onClick={() => setIsAdding(true)}
            >
              <Plus className="h-4 w-4 mr-1" /> Add Expense
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          {transactions.length === 0 ? (
            <div className="text-center py-6">
              <div className="bg-emerald-500/10 h-16 w-16 rounded-full flex items-center justify-center mx-auto mb-4 text-emerald-500">
                <Check className="h-8 w-8" />
              </div>
              <h3 className="text-lg font-bold">You're all settled up!</h3>
              <p className="text-muted-foreground mt-1">
                Add a shared expense to see balances here.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wider mb-2">
                Who owes who
              </h4>
              <div className="grid gap-3">
                {transactions.map((t, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-4 bg-muted/30 rounded-xl border border-border/50"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2 font-medium">
                        <span className="text-foreground">
                          {getUserName(t.from)}
                        </span>
                        <ArrowRight className="h-4 w-4 text-muted-foreground" />
                        <span className="text-foreground">
                          {getUserName(t.to)}
                        </span>
                      </div>
                    </div>
                    <div className="font-bold text-lg text-rose-500 flex items-center gap-1">
                      <IndianRupee className="h-4 w-4" />{" "}
                      {t.amount.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Expense Category Breakdown Chart */}
      {expenses.length > 0 && (
        <Card className="glass-card overflow-hidden">
          <CardHeader className="bg-muted/30 border-b pb-4">
            <CardTitle className="text-xl flex items-center gap-2">
              <Receipt className="h-5 w-5 text-primary" /> Category Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={Object.values(
                      expenses.reduce((acc, exp) => {
                        if (!acc[exp.category]) {
                          acc[exp.category] = { name: exp.category, value: 0 };
                        }
                        acc[exp.category].value += parseFloat(exp.amount as unknown as string);
                        return acc;
                      }, {} as Record<string, { name: string; value: number }>)
                    )}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {Object.values(
                      expenses.reduce((acc, exp) => {
                        if (!acc[exp.category]) acc[exp.category] = { name: exp.category, value: 0 };
                        acc[exp.category].value += parseFloat(exp.amount as unknown as string);
                        return acc;
                      }, {} as Record<string, { name: string; value: number }>)
                    ).map((entry, index) => {
                      const colors = ["#0ea5e9", "#22c55e", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899", "#14b8a6"];
                      return <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />;
                    })}
                  </Pie>
                  <RechartsTooltip formatter={(value: any) => [`₹${value.toLocaleString()}`, "Amount"]} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Add Expense Form (Inline Modal/Expandable) */}
      <AnimatePresence>
        {isAdding && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <Card className="border-primary shadow-lg border-2">
              <CardHeader className="pb-4 flex flex-row items-center justify-between">
                <CardTitle className="text-lg">
                  Add New Shared Expense
                </CardTitle>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsAdding(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Description</label>
                    <Input
                      placeholder="e.g. Dinner at Beach Club"
                      value={newExpense.description}
                      onChange={(e) =>
                        setNewExpense((prev) => ({
                          ...prev,
                          description: e.target.value,
                        }))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Total Amount</label>
                    <div className="relative">
                      <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="number"
                        placeholder="0.00"
                        className="pl-9"
                        value={newExpense.amount}
                        onChange={(e) =>
                          setNewExpense((prev) => ({
                            ...prev,
                            amount: e.target.value,
                          }))
                        }
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Paid By</label>
                    <select
                      className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                      value={newExpense.paidBy}
                      onChange={(e) =>
                        setNewExpense((prev) => ({
                          ...prev,
                          paidBy: e.target.value,
                        }))
                      }
                    >
                      {allUsers.map((u) => (
                        <option key={u.id} value={u.id}>
                          {u.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Split Type</label>
                    <select
                      className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                      value={newExpense.splitType}
                      onChange={(e) =>
                        setNewExpense((prev) => ({
                          ...prev,
                          splitType: e.target.value,
                        }))
                      }
                    >
                      <option value="equal">Split Equally</option>
                      {/* We can add percentages or exact amounts in future iterations */}
                    </select>
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <Button
                    variant="gradient"
                    onClick={handleAddExpense}
                    className="w-full md:w-auto"
                  >
                    Save Shared Expense
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Expense History */}
      <h3 className="text-lg font-bold flex items-center gap-2 mt-8">
        <Receipt className="h-5 w-5 text-primary" /> Expense History
      </h3>

      {isLoading ? (
        <div className="h-32 flex items-center justify-center text-muted-foreground">
          Loading expenses...
        </div>
      ) : expenses.length === 0 ? (
        <div className="h-32 flex items-center justify-center text-muted-foreground border border-dashed rounded-xl">
          No shared expenses added yet.
        </div>
      ) : (
        <div className="grid gap-3">
          {expenses.map((expense) => (
            <div
              key={expense.id}
              className="flex justify-between items-center p-4 bg-card rounded-xl border hover:shadow-md transition-shadow"
            >
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                  <Receipt className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-semibold text-foreground">
                    {expense.description}
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Paid by{" "}
                    <span className="font-medium text-foreground">
                      {expense.user?.name || "Someone"}
                    </span>{" "}
                    on {formatDate(expense.date)}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-lg flex items-center justify-end gap-1">
                  <IndianRupee className="h-4 w-4" />{" "}
                  {expense.amount.toLocaleString()}
                </p>
                <div className="flex items-center justify-end gap-1 text-xs text-muted-foreground mt-1">
                  <Users className="h-3 w-3" /> Split {expense.splitType}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
