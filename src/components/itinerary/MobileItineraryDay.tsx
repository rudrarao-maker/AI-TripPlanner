"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, MapPin, Clock, IndianRupee } from "lucide-react";
import { cn } from "@/lib/utils";

interface Activity {
  id: string;
  name: string;
  time?: string;
  location?: string;
  description?: string;
  category?: string;
  estimatedCost?: number;
  imageUrl?: string;
}

interface MobileItineraryDayProps {
  dayNumber: number;
  date: string;
  activities: Activity[];
  isExpanded: boolean;
  onToggle: () => void;
}

export function MobileItineraryDay({
  dayNumber,
  date,
  activities,
  isExpanded,
  onToggle,
}: MobileItineraryDayProps) {
  const totalCost = activities.reduce(
    (sum, act) => sum + (act.estimatedCost || 0),
    0
  );

  const formattedDate = (() => {
    try {
      return new Date(date).toLocaleDateString("en-IN", {
        weekday: "short",
        month: "short",
        day: "numeric",
      });
    } catch {
      return date;
    }
  })();

  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
      {/* Collapsed Header — always visible */}
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-3 p-4 text-left active:bg-muted/50 transition-colors"
      >
        {/* Day badge */}
        <div className="h-10 w-10 rounded-xl bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm shadow-sm shrink-0">
          {dayNumber}
        </div>

        <div className="flex-1 min-w-0">
          <div className="font-semibold text-sm text-foreground">
            Day {dayNumber}
          </div>
          <div className="text-xs text-muted-foreground">{formattedDate}</div>
        </div>

        {/* Quick stats */}
        <div className="flex items-center gap-3 text-xs text-muted-foreground shrink-0">
          <span className="bg-muted px-2 py-1 rounded-lg font-medium">
            {activities.length} activities
          </span>
          {totalCost > 0 && (
            <span className="flex items-center gap-0.5 font-medium">
              <IndianRupee className="h-3 w-3" />
              {totalCost.toLocaleString()}
            </span>
          )}
        </div>

        <ChevronDown
          className={cn(
            "h-5 w-5 text-muted-foreground transition-transform duration-300 shrink-0",
            isExpanded && "rotate-180"
          )}
        />
      </button>

      {/* Expanded Content */}
      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 space-y-3 border-t border-border/50 pt-3">
              {activities.map((activity, idx) => (
                <motion.div
                  key={activity.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05, duration: 0.3 }}
                  className="flex gap-3 p-3 bg-muted/30 rounded-xl border border-border/30"
                >
                  {/* Timeline dot */}
                  <div className="flex flex-col items-center pt-1 shrink-0">
                    <div className="h-2.5 w-2.5 rounded-full bg-primary shadow-sm" />
                    {idx < activities.length - 1 && (
                      <div className="w-px h-full bg-border mt-1" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm text-foreground line-clamp-1">
                      {activity.name}
                    </div>

                    <div className="flex flex-wrap items-center gap-2 mt-1">
                      {activity.time && (
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {activity.time}
                        </span>
                      )}
                      {activity.location && (
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                          <MapPin className="h-3 w-3" />
                          <span className="line-clamp-1">{activity.location}</span>
                        </span>
                      )}
                    </div>

                    {activity.description && (
                      <p className="text-xs text-muted-foreground mt-1.5 line-clamp-2 leading-relaxed">
                        {activity.description}
                      </p>
                    )}

                    {activity.estimatedCost != null && activity.estimatedCost > 0 && (
                      <div className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-md">
                        <IndianRupee className="h-3 w-3" />
                        {activity.estimatedCost.toLocaleString()}
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}

              {activities.length === 0 && (
                <div className="text-center py-6 text-sm text-muted-foreground">
                  No activities planned for this day
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
