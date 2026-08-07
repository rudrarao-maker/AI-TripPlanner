"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const SUGGESTIONS = [
  { id: "1", title: "Autumn in Kyoto", desc: "Experience the vibrant fall colors.", match: "98% Match" },
  { id: "2", title: "Santorini Escape", desc: "Luxury cliffside views.", match: "95% Match" },
];

export function AISuggestions() {
  return (
    <Card className="glass border-white/10 mt-8 relative overflow-hidden">
      <div className="absolute top-0 right-0 p-32 bg-primary/10 rounded-full blur-[80px] -z-10" />
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" /> AI Suggestions
        </CardTitle>
      </CardHeader>
      <CardContent className="grid md:grid-cols-2 gap-4">
        {SUGGESTIONS.map((item) => (
          <div key={item.id} className="p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-primary/50 transition-colors">
            <div className="flex justify-between items-start mb-2">
              <h4 className="font-bold text-sm">{item.title}</h4>
              <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-1 rounded-full">{item.match}</span>
            </div>
            <p className="text-xs text-muted-foreground mb-4">{item.desc}</p>
            <Button variant="ghost" size="sm" className="w-full text-xs hover:bg-primary hover:text-primary-foreground">
              Explore <ArrowRight className="h-3 w-3 ml-1" />
            </Button>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
