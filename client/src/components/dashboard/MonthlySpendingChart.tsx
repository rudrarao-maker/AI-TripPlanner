import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { formatCurrency } from "@/lib/utils";

const data = [
  { name: "Jan", spent: 15000 },
  { name: "Feb", spent: 42000 },
  { name: "Mar", spent: 8000 },
  { name: "Apr", spent: 120000 },
  { name: "May", spent: 3000 },
  { name: "Jun", spent: 65000 },
];

export function MonthlySpendingChart() {
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background/95 backdrop-blur-sm border p-3 rounded-lg shadow-xl">
          <p className="font-semibold mb-1">{label}</p>
          <p className="text-primary font-bold">
            {formatCurrency(payload[0].value)}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="glass-card shadow-lg mt-8">
      <CardHeader>
        <CardTitle className="text-xl">Monthly Spending</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="currentColor"
                className="opacity-10"
              />
              <XAxis
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "currentColor", opacity: 0.7 }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: "currentColor", opacity: 0.7 }}
                tickFormatter={(value) => `₹${value / 1000}k`}
              />
              <Tooltip
                content={<CustomTooltip />}
                cursor={{ fill: "currentColor", opacity: 0.05 }}
              />
              <Bar
                dataKey="spent"
                fill="currentColor"
                className="fill-primary"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
