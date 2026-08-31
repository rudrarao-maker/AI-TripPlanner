"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { Home, PlusCircle, Map, User, Search } from "lucide-react";
import { useAuth } from "@clerk/nextjs";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const MOBILE_TABS = [
  { label: "Explore", path: "/", icon: Search },
  { label: "Create", path: "/trip-planner", icon: PlusCircle },
  { label: "Trips", path: "/my-trips", icon: Map },
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
        "bg-background/95 backdrop-blur-xl supports-[backdrop-filter]:bg-background/80",
        "border-t border-border/40 shadow-[0_-8px_30px_-15px_rgba(0,0,0,0.1)]",
        "safe-bottom"
      )}
    >
      <div className="flex items-center justify-between h-[68px] px-4 max-w-md mx-auto">
        {MOBILE_TABS.map((tab) => {
          // Skip auth-required tabs if not signed in
          if (tab.requiresAuth && !isSignedIn) {
            return (
              <div key={tab.path} className="flex-1 flex flex-col items-center justify-center gap-1 opacity-40 pointer-events-none">
                <tab.icon className="h-[22px] w-[22px] text-muted-foreground" strokeWidth={2} />
                <span className="text-[10px] font-medium text-muted-foreground">{tab.label}</span>
              </div>
            );
          }

          const isActive =
            tab.path === "/"
              ? pathname === "/"
              : pathname.startsWith(tab.path);

          return (
            <Link
              key={tab.path}
              href={tab.path}
              className="flex-1 flex flex-col items-center justify-center h-full gap-1 relative group tap-highlight-transparent"
            >
              <div className="relative flex items-center justify-center w-12 h-8 rounded-full transition-colors duration-300">
                {isActive && (
                  <motion.div
                    layoutId="mobile-nav-pill"
                    className="absolute inset-0 bg-primary/10 rounded-full"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
                <tab.icon 
                  className={cn(
                    "h-[22px] w-[22px] relative z-10 transition-all duration-300",
                    isActive ? "text-primary stroke-[2.5px]" : "text-muted-foreground stroke-[2px] group-hover:text-foreground"
                  )} 
                />
              </div>
              <span
                className={cn(
                  "text-[10px] font-medium transition-colors duration-300",
                  isActive ? "text-foreground font-semibold" : "text-muted-foreground group-hover:text-foreground"
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

