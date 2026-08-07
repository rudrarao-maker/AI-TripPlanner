"use client";
import { Card, CardContent } from "@/components/ui/card";
import { Lightbulb, ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export function BudgetOptimizer() {
  return (
    <Card className="glass-card overflow-hidden border-yellow-500/30">
      <div className="absolute top-0 left-0 w-1 h-full bg-yellow-500" />
      <CardContent className="p-4 flex flex-col md:flex-row gap-4 items-start md:items-center justify-between relative">
        <div className="flex gap-3">
          <div className="mt-1 bg-yellow-500/20 p-2 rounded-full text-yellow-600 shrink-0">
            <Lightbulb className="h-5 w-5" />
          </div>
          <div>
            <h4 className="font-bold flex items-center gap-2">
              Optimization Alert{" "}
              <Sparkles className="h-3 w-3 text-yellow-500" />
            </h4>
            <p className="text-sm text-muted-foreground mt-1 max-w-md">
              We noticed you're spending 40% of your budget on transport.
              Switching to the{" "}
              <span className="font-semibold text-foreground">
                JR Rail Pass
              </span>{" "}
              instead of individual tickets could save you{" "}
              <span className="font-bold text-green-500">₹8,500</span>.
            </p>
          </div>
        </div>

        <Button
          variant="outline"
          size="sm"
          className="shrink-0 border-yellow-500/50 hover:bg-yellow-500/10 hover:text-yellow-700"
        >
          Apply Savings <ArrowRight className="h-4 w-4 ml-1" />
        </Button>
      </CardContent>
    </Card>
  );
}
