"use client";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Wallet, TrendingUp, TrendingDown } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface BudgetOverviewProps {
  totalBudget: number;
  totalSpent: number;
  durationDays?: number;
}

export function BudgetOverview({
  totalBudget,
  totalSpent,
  durationDays = 7,
}: BudgetOverviewProps) {
  const percentageSpent = Math.min((totalSpent / totalBudget) * 100, 100);
  const remaining = totalBudget - totalSpent;
  const isOverBudget = remaining < 0;

  return (
    <Card className="glass-card border-none bg-gradient-to-br from-primary/10 via-background to-accent/10">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-xl">
          <Wallet className="h-5 w-5 text-primary" />
          Trip Budget Overview
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6 mt-2">
          <div>
            <p className="text-sm text-muted-foreground font-medium mb-1">
              Total Budget
            </p>
            <p className="text-2xl font-bold">{formatCurrency(totalBudget)}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground font-medium mb-1">
              Total Spent
            </p>
            <p className="text-2xl font-bold text-accent">
              {formatCurrency(totalSpent)}
            </p>
          </div>
          <div className="col-span-2 md:col-span-1">
            <p className="text-sm text-muted-foreground font-medium mb-1">
              Remaining
            </p>
            <div className="flex items-center gap-2">
              <p
                className={`text-2xl font-bold ${isOverBudget ? "text-destructive" : "text-emerald-500"}`}
              >
                {formatCurrency(Math.abs(remaining))}
              </p>
              {isOverBudget ? (
                <span className="flex items-center text-xs font-medium text-destructive bg-destructive/10 px-2 py-1 rounded-full">
                  <TrendingUp className="h-3 w-3 mr-1" /> Over
                </span>
              ) : (
                <span className="flex items-center text-xs font-medium text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded-full">
                  <TrendingDown className="h-3 w-3 mr-1" /> Under
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm font-medium">
            <span>{percentageSpent.toFixed(1)}% Used</span>
            <span
              className={
                isOverBudget ? "text-destructive" : "text-muted-foreground"
              }
            >
              {isOverBudget ? "Budget Exceeded" : "On Track"}
            </span>
          </div>
          {/* Note: In a real app, we would use a Shadcn Progress component. 
              Here we build a custom styled one since the Shadcn init failed. */}
          <div className="h-3 w-full bg-muted rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-1000 ease-out ${isOverBudget ? "bg-destructive" : "bg-gradient-to-r from-primary to-accent"}`}
              style={{ width: `${percentageSpent}%` }}
            />
          </div>
        </div>

        {durationDays > 0 && (
          <div className="mt-6 pt-6 border-t">
            <div className="flex justify-between items-center mb-2">
              <div>
                <p className="text-sm text-muted-foreground font-medium">
                  Daily Limit
                </p>
                <p className="font-bold text-foreground">
                  {formatCurrency(totalBudget / durationDays)}/day
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground font-medium">
                  Current Average
                </p>
                <p
                  className={`font-bold ${totalSpent / durationDays > totalBudget / durationDays ? "text-destructive" : "text-emerald-500"}`}
                >
                  {formatCurrency(totalSpent / durationDays)}/day
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
