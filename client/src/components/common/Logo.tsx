import { Link } from "react-router-dom";
import { Plane } from "lucide-react";
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  iconClassName?: string;
  textClassName?: string;
  withText?: boolean;
}

export function Logo({
  className,
  iconClassName,
  textClassName,
  withText = true,
}: LogoProps) {
  return (
    <Link to="/" className={cn("flex items-center gap-2 group", className)}>
      <div
        className={cn(
          "flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent text-white shadow-lg shadow-primary/20 transition-transform group-hover:scale-105 group-hover:rotate-6",
          iconClassName,
        )}
      >
        <Plane className="h-6 w-6 -rotate-45 fill-white/20" />
      </div>
      {withText && (
        <span
          className={cn(
            "font-heading text-xl font-bold tracking-tight",
            textClassName,
          )}
        >
          Trip<span className="text-primary">Craft</span> AI
        </span>
      )}
    </Link>
  );
}
