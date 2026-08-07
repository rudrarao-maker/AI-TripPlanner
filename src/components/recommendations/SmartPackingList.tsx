"use client";

import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Sparkles, Loader2, CloudRain, Sun, Snowflake } from "lucide-react";

interface PackingItem {
  id: string;
  name: string;
  category: string;
  packed: boolean;
}

// Mock AI generated list for demonstration
const mockGenerateList = (destination: string): Promise<PackingItem[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([
        { id: "1", name: "Passport & Visas", category: "Essentials", packed: false },
        { id: "2", name: "Travel Adapter", category: "Electronics", packed: false },
        { id: "3", name: "Lightweight Rain Jacket", category: "Clothing", packed: false },
        { id: "4", name: "Comfortable Walking Shoes", category: "Clothing", packed: false },
        { id: "5", name: "Portable Power Bank", category: "Electronics", packed: false },
        { id: "6", name: "Sunscreen & Sunglasses", category: "Toiletries", packed: false },
      ]);
    }, 1500);
  });
};

export function SmartPackingList({ destination }: { destination: string }) {
  const [items, setItems] = useState<PackingItem[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [weather] = useState<"sunny" | "rainy" | "cold">("sunny"); // Mock weather

  const generateList = async () => {
    setIsGenerating(true);
    // In a real app, this would hit the Gemini API via a server action
    const newItems = await mockGenerateList(destination);
    setItems(newItems);
    setIsGenerating(false);
  };

  const toggleItem = (id: string) => {
    setItems(items.map(item => 
      item.id === id ? { ...item, packed: !item.packed } : item
    ));
  };

  const progress = items.length === 0 ? 0 : Math.round((items.filter(i => i.packed).length / items.length) * 100);

  return (
    <Card className="p-6 glass border-primary/20">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Smart Packing List
          </h3>
          <p className="text-sm text-muted-foreground mt-1 flex items-center gap-2">
            Weather forecast for {destination}: 
            {weather === "sunny" && <><Sun className="h-4 w-4 text-orange-500"/> Sunny</>}
            {weather === "rainy" && <><CloudRain className="h-4 w-4 text-blue-500"/> Rainy</>}
            {weather === "cold" && <><Snowflake className="h-4 w-4 text-cyan-500"/> Cold</>}
          </p>
        </div>
        
        <div className="text-right">
          <div className="text-2xl font-bold text-primary">{progress}%</div>
          <div className="text-xs text-muted-foreground uppercase tracking-wider">Packed</div>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-8 bg-muted/30 rounded-xl border border-dashed border-primary/30">
          <p className="text-muted-foreground mb-4">
            Let AI generate a customized packing list based on the weather and activities in {destination}.
          </p>
          <Button onClick={generateList} disabled={isGenerating} className="gap-2">
            {isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            {isGenerating ? "Analyzing Destination..." : "Generate List"}
          </Button>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Progress Bar */}
          <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
            <div 
              className="h-full bg-primary transition-all duration-500" 
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="space-y-4">
            {['Essentials', 'Clothing', 'Electronics', 'Toiletries'].map(category => {
              const categoryItems = items.filter(i => i.category === category);
              if (categoryItems.length === 0) return null;
              
              return (
                <div key={category} className="space-y-2">
                  <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">{category}</h4>
                  <div className="space-y-2">
                    {categoryItems.map(item => (
                      <div 
                        key={item.id} 
                        className={`flex items-center gap-3 p-3 rounded-lg border transition-colors cursor-pointer ${
                          item.packed ? 'bg-primary/5 border-primary/20 opacity-60' : 'bg-background hover:bg-muted/50 border-border/50'
                        }`}
                        onClick={() => toggleItem(item.id)}
                      >
                        <Checkbox 
                          checked={item.packed} 
                          onCheckedChange={() => toggleItem(item.id)}
                        />
                        <span className={item.packed ? 'line-through' : ''}>
                          {item.name}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </Card>
  );
}
