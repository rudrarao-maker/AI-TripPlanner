"use client";
import { Plane } from "lucide-react";
import { cn } from "@/lib/utils";

interface LoadingSpinnerProps {
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
  text?: string;
}

export function LoadingSpinner({
  className,
  size = "md",
  text,
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "h-6 w-6",
    md: "h-10 w-10",
    lg: "h-16 w-16",
    xl: "h-24 w-24",
  };

  const iconSizes = {
    sm: "h-3 w-3",
    md: "h-5 w-5",
    lg: "h-8 w-8",
    xl: "h-12 w-12",
  };

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-4",
        className,
      )}
    >
      <div
        className={cn(
          "relative flex items-center justify-center animate-spin",
          sizeClasses[size],
        )}
      >
        {/* Outer dashed ring */}
        <div className="absolute inset-0 rounded-full border-2 border-dashed border-primary/40"></div>
        {/* Inner solid ring */}
        <div
          className="absolute inset-1 rounded-full border-2 border-t-accent border-r-transparent border-b-primary border-l-transparent animate-spin"
          style={{ animationDirection: "reverse", animationDuration: "1.5s" }}
        ></div>
        {/* Center icon */}
        <Plane
          className={cn("text-primary -rotate-45", iconSizes[size])}
          style={{
            animation: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
          }}
        />
      </div>

      {text && (
        <p className="animate-pulse text-sm font-medium text-muted-foreground">
          {text}
        </p>
      )}
    </div>
  );
}
