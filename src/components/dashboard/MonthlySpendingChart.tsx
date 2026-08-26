"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Sector } from "recharts";
import { formatCurrency } from "@/lib/utils";
import { TiltCard } from "@/components/ui/tilt-card";

const data = [
  { name: "Accommodation", value: 45000, color: "#0d9488" }, // Teal
  { name: "Transportation", value: 35000, color: "#0ea5e9" }, // Light Blue
  { name: "Food & Dining", value: 25000, color: "#6366f1" }, // Indigo
  { name: "Activities", value: 15000, color: "#8b5cf6" }, // Purple
  { name: "Shopping & Misc", value: 10000, color: "#ec4899" }, // Pink
];

const renderActiveShape = (props: any) => {
  const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill, payload, value } = props;

  return (
    <g>
      <text x={cx} y={cy - 10} dy={8} textAnchor="middle" fill={fill} className="text-2xl font-bold">
        {formatCurrency(value)}
      </text>
      <text x={cx} y={cy + 15} dy={8} textAnchor="middle" fill="#71717a" className="text-sm">
        {payload.name}
      </text>
      {/* The 3D-like elevated slice */}
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius + 8}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
        style={{ filter: `drop-shadow(0px 10px 15px ${fill}40)` }}
      />
      <Sector
        cx={cx}
        cy={cy}
        startAngle={startAngle}
        endAngle={endAngle}
        innerRadius={outerRadius + 12}
        outerRadius={outerRadius + 15}
        fill={fill}
      />
    </g>
  );
};

export function MonthlySpendingChart() {
  const [activeIndex, setActiveIndex] = useState(0);

  const onPieEnter = (_: any, index: number) => {
    setActiveIndex(index);
  };

  return (
    <TiltCard maxTilt={2} className="mt-8 shadow-lg">
      <Card className="border-none bg-card">
        <CardHeader>
          <CardTitle className="text-xl">Trip Budget Breakdown</CardTitle>
          <p className="text-sm text-muted-foreground">Estimated distribution for your upcoming trips</p>
        </CardHeader>
        <CardContent>
          <div className="h-[350px] w-full" style={{ transform: "translateZ(30px)" }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  {...({ activeIndex } as any)}
                  activeShape={renderActiveShape}
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={90}
                  outerRadius={120}
                  dataKey="value"
                  onMouseEnter={onPieEnter}
                  animationDuration={800}
                  animationEasing="ease-out"
                  stroke="none"
                >
                  {data.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.color}
                      style={{ filter: activeIndex === index ? 'none' : 'brightness(0.8)' }}
                    />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </TiltCard>
  );
}
