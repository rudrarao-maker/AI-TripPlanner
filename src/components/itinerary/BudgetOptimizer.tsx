"use client";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Wallet,
  TrendingDown,
  TrendingUp,
  AlertCircle,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export function BudgetOptimizer({
  budget,
  itineraryDays = [],
}: {
  budget: number;
  itineraryDays?: any[];
}) {
  const [currency, setCurrency] = useState("INR");

  const totalHotelCost = itineraryDays.reduce((sum: number, d: any) => {
    const hotelCost =
      d.activities
        ?.filter((a: any) => a.category === "hotel")
        .reduce(
          (s: number, a: any) => s + (a.estimatedCost || a.cost || 0),
          0,
        ) || 0;
    return sum + hotelCost;
  }, 0);

  const totalActivityCost = itineraryDays.reduce((sum: number, d: any) => {
    const actCost =
      d.activities
        ?.filter(
          (a: any) => a.category !== "hotel" && a.category !== "transport",
        )
        .reduce(
          (s: number, a: any) => s + (a.estimatedCost || a.cost || 0),
          0,
        ) || 0;
    return sum + actCost;
  }, 0);

  const totalEstimated = totalHotelCost + totalActivityCost + 15000; // Adding dummy transport cost
  const isOverBudget = totalEstimated > budget;
  const savings = Math.abs(budget - totalEstimated);

  return (
    <Card className="glass-card overflow-hidden">
      <CardHeader className="bg-primary/5 pb-4 border-b border-border/50 flex flex-row items-center justify-between">
        <CardTitle className="text-lg flex items-center gap-2">
          <Wallet className="h-5 w-5 text-primary" /> AI Budget Optimizer
        </CardTitle>
        <span className="text-xs font-medium px-2 py-1 bg-background rounded-md shadow-sm border border-border/50">
          Expected vs Actual
        </span>
      </CardHeader>
      <CardContent className="p-5 space-y-6">
        <div className="flex justify-between items-center bg-card rounded-xl p-4 border border-border/50 shadow-sm">
          <div>
            <p className="text-sm text-muted-foreground">Target Budget</p>
            <p className="text-2xl font-bold">₹{budget.toLocaleString()}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Est. Total</p>
            <p
              className={`text-2xl font-bold ${isOverBudget ? "text-red-500" : "text-green-500"}`}
            >
              ₹{totalEstimated.toLocaleString()}
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground flex items-center gap-2">
              🏨 Accommodation
            </span>
            <span className="font-medium">
              ₹{totalHotelCost.toLocaleString()}
            </span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground flex items-center gap-2">
              🎯 Activities & Food
            </span>
            <span className="font-medium">
              ₹{totalActivityCost.toLocaleString()}
            </span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground flex items-center gap-2">
              ✈️ Transport (Est.)
            </span>
            <span className="font-medium">₹15,000</span>
          </div>
        </div>

        {/* AI Insight */}
        <div
          className={`p-4 rounded-xl flex items-start gap-3 ${isOverBudget ? "bg-red-500/10 text-red-700 dark:text-red-400" : "bg-green-500/10 text-green-700 dark:text-green-400"}`}
        >
          {isOverBudget ? (
            <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
          ) : (
            <Sparkles className="h-5 w-5 shrink-0 mt-0.5" />
          )}
          <div>
            <p className="font-semibold text-sm">
              {isOverBudget
                ? "You are over budget!"
                : "Great! You are under budget."}
            </p>
            <p className="text-xs mt-1 opacity-90">
              {isOverBudget
                ? `The AI estimates you will spend ₹${savings.toLocaleString()} more than your target. Consider downgrading the hotel on Day 2 to save ₹4,500.`
                : `You have ₹${savings.toLocaleString()} left over. You could upgrade to a premium dining experience on Day 3!`}
            </p>
          </div>
        </div>

        {isOverBudget && (
          <Button
            variant="outline"
            className="w-full text-primary hover:text-primary border-primary/20 hover:bg-primary/10"
          >
            <TrendingDown className="h-4 w-4 mr-2" /> Optimize My Budget
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
