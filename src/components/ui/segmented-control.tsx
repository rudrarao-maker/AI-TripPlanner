"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface SegmentedControlProps {
  options: { label: string; value: string; icon?: React.ReactNode }[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export function SegmentedControl({ options, value, onChange, className }: SegmentedControlProps) {
  return (
    <div className={cn("flex p-1 bg-muted/50 rounded-lg border border-border", className)}>
      {options.map((option) => {
        const isActive = value === option.value;
        return (
          <button
            key={option.value}
            onClick={() => onChange(option.value)}
            className={cn(
              "relative flex-1 flex items-center justify-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md transition-colors z-10",
              isActive ? "text-foreground" : "text-muted-foreground hover:text-foreground"
            )}
          >
            {isActive && (
              <motion.div
                layoutId="segmented-control-bg"
                className="absolute inset-0 bg-background rounded-md shadow-sm border border-border"
                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
              />
            )}
            <span className="relative z-20 flex items-center gap-2">
              {option.icon}
              {option.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
