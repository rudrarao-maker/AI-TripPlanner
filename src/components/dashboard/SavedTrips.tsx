"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bookmark, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";

const MOCK_SAVED = [
  { id: "1", name: "Paris Getaway", destination: "Paris, France" },
  { id: "2", name: "Tokyo Draft", destination: "Tokyo, Japan" },
];

export function SavedTrips() {
  return (
    <Card className="glass border-white/10 mt-8">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <Bookmark className="h-5 w-5 text-primary" /> Saved Trips
        </CardTitle>
        <Button variant="ghost" size="sm" className="text-xs">
          View All
        </Button>
      </CardHeader>
      <CardContent className="space-y-4 pt-4">
        {MOCK_SAVED.length === 0 ? (
          <div className="text-sm text-center text-muted-foreground py-4">
            No saved trips yet.
          </div>
        ) : (
          MOCK_SAVED.map((trip) => (
            <div
              key={trip.id}
              className="flex items-center justify-between p-3 rounded-xl hover:bg-white/5 cursor-pointer transition-colors border border-transparent hover:border-white/10"
            >
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-accent/10 flex items-center justify-center">
                  <MapPin className="h-5 w-5 text-accent" />
                </div>
                <div>
                  <p className="font-medium text-sm">{trip.name}</p>
                  <p className="text-xs text-muted-foreground">{trip.destination}</p>
                </div>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
