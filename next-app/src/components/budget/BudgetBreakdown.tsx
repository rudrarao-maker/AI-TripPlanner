"use client";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { EXPENSE_CATEGORIES } from "@/lib/constants";
import { formatCurrency } from "@/lib/utils";

interface BreakdownData {
  name: string;
  value: number;
  color: string;
}

interface BudgetBreakdownProps {
  data: BreakdownData[];
}

export function BudgetBreakdown({ data }: BudgetBreakdownProps) {
  // Add colors from constants
  const chartData = data.map((item) => {
    const categoryInfo = EXPENSE_CATEGORIES.find(
      (c) => c.label.toLowerCase() === item.name.toLowerCase(),
    );
    return {
      ...item,
      color: categoryInfo?.color || "#cbd5e1",
    };
  });

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="glass p-3 rounded-lg border shadow-lg text-sm">
          <p className="font-semibold mb-1">{payload[0].name}</p>
          <p className="text-primary font-bold">
            {formatCurrency(payload[0].value)}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-lg">Expenses by Category</CardTitle>
      </CardHeader>
      <CardContent>
        {chartData.length > 0 ? (
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                  animationDuration={1500}
                  animationEasing="ease-out"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  layout="horizontal"
                  verticalAlign="bottom"
                  align="center"
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-[300px] flex items-center justify-center text-muted-foreground border-2 border-dashed rounded-xl">
            No expenses recorded yet.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
