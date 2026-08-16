"use client";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shirt, Laptop, Pill, Briefcase } from "lucide-react";

const INITIAL_PACKING_LIST = {
  essentials: [
    { id: "e1", label: "Passport & ID", checked: false },
    { id: "e2", label: "Travel Insurance", checked: false },
    { id: "e3", label: "Flight Tickets", checked: false },
    { id: "e4", label: "Local Currency & Cards", checked: false },
  ],
  clothing: [
    { id: "c1", label: "T-Shirts (x5)", checked: false },
    { id: "c2", label: "Shorts & Pants", checked: false },
    { id: "c3", label: "Swimwear", checked: false },
    { id: "c4", label: "Comfortable Walking Shoes", checked: false },
    { id: "c5", label: "Light Jacket / Sweater", checked: false },
  ],
  electronics: [
    { id: "t1", label: "Smartphone & Charger", checked: false },
    { id: "t2", label: "Universal Power Adapter", checked: false },
    { id: "t3", label: "Power Bank", checked: false },
    { id: "t4", label: "Headphones", checked: false },
  ],
  health: [
    { id: "h1", label: "Prescription Medications", checked: false },
    { id: "h2", label: "Pain Relievers (Advil/Tylenol)", checked: false },
    { id: "h3", label: "Sunscreen & Aloe Vera", checked: false },
    { id: "h4", label: "Band-aids & First Aid", checked: false },
  ],
};

export function PackingList({ aiPackingItems = [] }: { aiPackingItems?: string[] }) {
  // Dynamically build the initial list, injecting AI items into a new category
  const getInitialList = () => {
    const list: Record<string, { id: string, label: string, checked: boolean }[]> = {
      ...INITIAL_PACKING_LIST,
    };
    
    if (aiPackingItems && aiPackingItems.length > 0) {
      list["smart"] = aiPackingItems.map((item, idx) => ({
        id: `ai-${idx}`,
        label: item,
        checked: false
      }));
    }
    
    return list;
  };

  const [list, setList] = useState(getInitialList());

  const toggleItem = (
    category: keyof typeof INITIAL_PACKING_LIST,
    id: string,
  ) => {
    setList((prev) => ({
      ...prev,
      [category]: prev[category].map((item) =>
        item.id === id ? { ...item, checked: !item.checked } : item,
      ),
    }));
  };

  const getProgress = (category: keyof typeof INITIAL_PACKING_LIST) => {
    const total = list[category].length;
    const checked = list[category].filter((i) => i.checked).length;
    return Math.round((checked / total) * 100);
  };

  const categories = [
    {
      key: "essentials" as const,
      title: "Essentials",
      icon: <Briefcase className="h-5 w-5 text-primary" />,
    },
    {
      key: "clothing" as const,
      title: "Clothing",
      icon: <Shirt className="h-5 w-5 text-accent" />,
    },
    {
      key: "electronics" as const,
      title: "Electronics",
      icon: <Laptop className="h-5 w-5 text-blue-500" />,
    },
    {
      key: "health" as const,
      title: "Health & Toiletries",
      icon: <Pill className="h-5 w-5 text-emerald-500" />,
    },
  ];

  if (list["smart"]) {
    categories.unshift({
      key: "smart" as any,
      title: "Smart Suggestions (AI)",
      icon: <Briefcase className="h-5 w-5 text-purple-500" />
    });
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {categories.map((cat) => (
        <Card key={cat.key} className="glass-card">
          <CardHeader className="pb-3 border-b border-border/50">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                {cat.icon} {cat.title}
              </CardTitle>
              <span className="text-sm font-bold text-muted-foreground">
                {getProgress(cat.key)}%
              </span>
            </div>
            <div className="w-full bg-muted h-1.5 rounded-full mt-2 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-500"
                style={{ width: `${getProgress(cat.key)}%` }}
              />
            </div>
          </CardHeader>
          <CardContent className="pt-4 space-y-3">
            {list[cat.key].map((item) => (
              <div
                key={item.id}
                className="flex items-center space-x-3 group cursor-pointer"
                onClick={() => toggleItem(cat.key, item.id)}
              >
                <div
                  className={`flex items-center justify-center h-5 w-5 rounded border ${item.checked ? "bg-primary border-primary text-primary-foreground" : "border-input bg-transparent group-hover:border-primary/50"}`}
                >
                  {item.checked && (
                    <svg
                      width="15"
                      height="15"
                      viewBox="0 0 15 15"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M11.4669 3.72684C11.7558 3.91574 11.8369 4.30308 11.648 4.59198L7.39799 11.092C7.29783 11.2452 7.13556 11.3467 6.95402 11.3699C6.77247 11.3931 6.58989 11.3355 6.45446 11.2124L3.70446 8.71241C3.44905 8.48022 3.43023 8.08494 3.66242 7.82953C3.89461 7.57412 4.28989 7.55529 4.5453 7.78749L6.75292 9.79441L10.6018 3.90792C10.7907 3.61902 11.178 3.53795 11.4669 3.72684Z"
                        fill="currentColor"
                        fillRule="evenodd"
                        clipRule="evenodd"
                      ></path>
                    </svg>
                  )}
                </div>
                <label
                  className={`text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer ${item.checked ? "line-through text-muted-foreground" : ""}`}
                >
                  {item.label}
                </label>
              </div>
            ))}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
