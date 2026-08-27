"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { Home, Plane, Map, User } from "lucide-react";
import { useAuth } from "@clerk/nextjs";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const MOBILE_TABS = [
  { label: "Home", path: "/", icon: Home },
  { label: "Plan Trip", path: "/trip-planner", icon: Plane, isCTA: true },
  { label: "My Trips", path: "/my-trips", icon: Map },
  { label: "Profile", path: "/dashboard", icon: User, requiresAuth: true },
];

export function MobileBottomNav() {
  const pathname = usePathname();
  const { isSignedIn } = useAuth();

  // Hide bottom nav on trip-planner chat page (so it doesn't cover input)
  const hideOnRoutes = ["/trip-planner"];
  const shouldHide = hideOnRoutes.some(
    (route) => pathname === route || pathname.startsWith(route + "/")
  );

  if (shouldHide) return null;

  return (
    <nav
      className={cn(
        "fixed bottom-0 left-0 right-0 z-50 md:hidden",
        "bg-background/80 backdrop-blur-xl",
        "border-t border-border/50",
        "safe-bottom"
      )}
    >
      <div className="flex items-center justify-around h-16 px-2 max-w-lg mx-auto">
        {MOBILE_TABS.map((tab) => {
          // Skip auth-required tabs if not signed in
          if (tab.requiresAuth && !isSignedIn) {
            return (
              <div key={tab.path} className="flex-1 flex flex-col items-center justify-center gap-0.5 opacity-40 pointer-events-none">
                <tab.icon className="h-5 w-5" />
                <span className="text-[10px] font-medium">{tab.label}</span>
              </div>
            );
          }

          const isActive =
            tab.path === "/"
              ? pathname === "/"
              : pathname.startsWith(tab.path);

          if (tab.isCTA) {
            return (
              <Link
                key={tab.path}
                href={tab.path}
                className="flex-1 flex items-center justify-center -mt-5"
              >
                <div
                  className={cn(
                    "relative flex flex-col items-center justify-center",
                    "w-14 h-14 rounded-full shadow-lg",
                    "bg-primary text-primary-foreground",
                    "active:scale-95 transition-transform duration-150"
                  )}
                >
                  <tab.icon className="h-6 w-6" />
                  <span className="text-[9px] font-bold mt-0.5 tracking-wide">PLAN</span>
                </div>
              </Link>
            );
          }

          return (
            <Link
              key={tab.path}
              href={tab.path}
              className={cn(
                "flex-1 flex flex-col items-center justify-center gap-0.5 py-2 relative",
                "transition-colors duration-200",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground active:text-foreground"
              )}
            >
              {isActive && (
                <motion.div
                  layoutId="mobile-tab-indicator"
                  className="absolute -top-[1px] left-1/2 -translate-x-1/2 w-8 h-0.5 bg-primary rounded-full"
                  transition={{ type: "spring", stiffness: 500, damping: 35 }}
                />
              )}
              <tab.icon className={cn("h-5 w-5", isActive && "stroke-[2.5]")} />
              <span
                className={cn(
                  "text-[10px] font-medium",
                  isActive && "font-bold"
                )}
              >
                {tab.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
