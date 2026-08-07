"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, History } from "lucide-react";

const RECENT_SEARCHES = [
  { id: "1", query: "Maldives for honeymoon", time: "2 hours ago" },
  { id: "2", query: "Cheap flights to Rome", time: "Yesterday" },
  { id: "3", query: "Backpacking in Thailand", time: "3 days ago" },
];

export function RecentSearches() {
  return (
    <Card className="glass border-white/10 mt-8">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <History className="h-5 w-5 text-primary" /> Recent Searches
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 pt-2">
        {RECENT_SEARCHES.map((search) => (
          <div
            key={search.id}
            className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 cursor-pointer transition-colors"
          >
            <Search className="h-4 w-4 text-muted-foreground" />
            <div className="flex-1">
              <p className="text-sm font-medium">{search.query}</p>
              <p className="text-xs text-muted-foreground">{search.time}</p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
