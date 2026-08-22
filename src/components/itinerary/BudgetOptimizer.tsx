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


const EXCHANGE_RATES: Record<string, number> = {
  INR: 1,
  USD: 0.012,
  EUR: 0.011,
  GBP: 0.0095,
  AUD: 0.018,
  JPY: 1.8,
};

const CURRENCY_SYMBOLS: Record<string, string> = {
  INR: "₹",
  USD: "$",
  EUR: "€",
  GBP: "£",
  AUD: "A$",
  JPY: "¥",
};

export function BudgetOptimizer({
  budget,
  itineraryDays = [],
  tripSummary,
}: {
  budget: number;
  itineraryDays?: any[];
  tripSummary?: any;
}) {
  const [currency, setCurrency] = useState("INR");
  const rate = EXCHANGE_RATES[currency] || 1;
  const symbol = CURRENCY_SYMBOLS[currency] || "₹";

  const convert = (amount: number) => {
    return (amount * rate).toLocaleString(undefined, { maximumFractionDigits: 0 });
  };

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
            <p className="text-sm text-muted-foreground flex items-center justify-between">
              Target Budget
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="h-6 text-xs w-20 border-none bg-primary/5 ml-2 rounded outline-none"
              >
                {Object.keys(EXCHANGE_RATES).map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </p>
            <p className="text-2xl font-bold">{symbol}{convert(budget)}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Est. Total</p>
            <p
              className={`text-2xl font-bold ${isOverBudget ? "text-red-500" : "text-green-500"}`}
            >
              {symbol}{convert(totalEstimated)}
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground flex items-center gap-2">
              🏨 Accommodation
            </span>
            <span className="font-medium">
              {symbol}{convert(totalHotelCost)}
            </span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground flex items-center gap-2">
              🎯 Activities & Food
            </span>
            <span className="font-medium">
              {symbol}{convert(totalActivityCost)}
            </span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground flex items-center gap-2">
              ✈️ Transport (Est.)
            </span>
            <span className="font-medium">{symbol}{convert(15000)}</span>
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
                ? `The AI estimates you will spend ${symbol}${convert(savings)} more than your target.`
                : `You have ${symbol}${convert(savings)} left over. You could upgrade to a premium dining experience!`}
            </p>
          </div>
        </div>

        {/* Financial Tips */}
        {tripSummary?.financialAdvice && (
          <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-800 rounded-xl p-4 space-y-2">
            <p className="text-xs font-semibold text-blue-800 dark:text-blue-300 uppercase tracking-wider">Local Financial Tips</p>
            <ul className="text-sm text-blue-700 dark:text-blue-400 space-y-1 list-disc list-inside">
              {tripSummary.financialAdvice.map((tip: string, idx: number) => (
                <li key={idx}>{tip}</li>
              ))}
            </ul>
          </div>
        )}

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
