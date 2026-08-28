import { List, Map as MapIcon, MessageSquareText } from "lucide-react";
import { cn } from "@/lib/utils";

type ViewMode = "list" | "map" | "chat";

interface MobileNavProps {
  activeView: ViewMode;
  onViewChange: (view: ViewMode) => void;
}

export function TripPlannerMobileNav({ activeView, onViewChange }: MobileNavProps) {
  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[60] lg:hidden w-[90%] max-w-sm">
      <div className="bg-background/80 backdrop-blur-xl border border-border/50 p-1.5 rounded-full shadow-2xl flex items-center justify-between gap-1">
        <button
          onClick={() => onViewChange("list")}
          className={cn(
            "flex-1 flex items-center justify-center gap-2 py-2.5 rounded-full text-sm font-medium transition-all",
            activeView === "list" 
              ? "bg-primary text-primary-foreground shadow-sm" 
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <List className="w-4 h-4" />
          <span>List</span>
        </button>
        
        <button
          onClick={() => onViewChange("map")}
          className={cn(
            "flex-1 flex items-center justify-center gap-2 py-2.5 rounded-full text-sm font-medium transition-all",
            activeView === "map" 
              ? "bg-primary text-primary-foreground shadow-sm" 
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <MapIcon className="w-4 h-4" />
          <span>Map</span>
        </button>

        <button
          onClick={() => onViewChange("chat")}
          className={cn(
            "flex-1 flex items-center justify-center gap-2 py-2.5 rounded-full text-sm font-medium transition-all",
            activeView === "chat" 
              ? "bg-primary text-primary-foreground shadow-sm" 
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <MessageSquareText className="w-4 h-4" />
          <span>Assistant</span>
        </button>
      </div>
    </div>
  );
}
