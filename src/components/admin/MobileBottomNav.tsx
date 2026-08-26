"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  LayoutDashboard, Users, Map, CreditCard, 
  Compass, Building2, Bot, ShieldAlert, Settings, MoreHorizontal, X, LogOut
} from "lucide-react";
import { useClerk } from "@clerk/nextjs";

const PRIMARY_LINKS = [
  { href: "/admin", label: "Overview", icon: <LayoutDashboard className="h-6 w-6" /> },
  { href: "/admin/users", label: "Users", icon: <Users className="h-6 w-6" /> },
  { href: "/admin/trips", label: "Trips", icon: <Map className="h-6 w-6" /> },
  { href: "/admin/bookings", label: "Bookings", icon: <CreditCard className="h-6 w-6" /> },
];

const SECONDARY_LINKS = [
  { href: "/admin/destinations", label: "Destinations", icon: <Compass className="h-5 w-5" /> },
  { href: "/admin/hotels", label: "Hotels", icon: <Building2 className="h-5 w-5" /> },
  { href: "/admin/payments", label: "Payments", icon: <CreditCard className="h-5 w-5" /> },
  { href: "/admin/ai", label: "AI Management", icon: <Bot className="h-5 w-5" /> },
  { href: "/admin/audit-logs", label: "Audit Logs", icon: <ShieldAlert className="h-5 w-5" /> },
  { href: "/admin/settings", label: "Settings", icon: <Settings className="h-5 w-5" /> },
];

export function MobileBottomNav() {
  const pathname = usePathname();
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const { signOut } = useClerk();

  return (
    <>
      {/* Bottom Navigation Bar */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-background/90 backdrop-blur-xl border-t border-white/10 pb-safe">
        <div className="flex items-center justify-around px-2 py-2">
          {PRIMARY_LINKS.map((link) => {
            const isActive = pathname === link.href || (pathname.startsWith(link.href) && link.href !== '/admin');
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex flex-col items-center justify-center w-16 h-14 rounded-xl transition-all ${
                  isActive 
                    ? "text-primary font-semibold" 
                    : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                }`}
              >
                <div className={`mb-1 transition-transform ${isActive ? "scale-110" : ""}`}>
                  {link.icon}
                </div>
                <span className="text-[10px]">{link.label}</span>
              </Link>
            );
          })}
          
          <button
            onClick={() => setIsMoreOpen(true)}
            className="flex flex-col items-center justify-center w-16 h-14 rounded-xl text-muted-foreground hover:text-foreground hover:bg-white/5 transition-all"
          >
            <div className="mb-1">
              <MoreHorizontal className="h-6 w-6" />
            </div>
            <span className="text-[10px]">More</span>
          </button>
        </div>
      </nav>

      {/* "More" Slide-up Drawer */}
      <AnimatePresence>
        {isMoreOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMoreOpen(false)}
              className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm lg:hidden"
            />
            
            {/* Drawer */}
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed bottom-0 left-0 right-0 z-[70] bg-card rounded-t-3xl border-t border-white/10 flex flex-col lg:hidden max-h-[85vh]"
            >
              <div className="flex items-center justify-between p-5 border-b border-white/5">
                <h3 className="font-semibold text-lg">More Menu</h3>
                <button 
                  onClick={() => setIsMoreOpen(false)}
                  className="p-2 bg-white/5 rounded-full hover:bg-white/10 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-4 space-y-2 pb-8">
                {SECONDARY_LINKS.map((link) => {
                  const isActive = pathname === link.href || (pathname.startsWith(link.href) && link.href !== '/admin');
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setIsMoreOpen(false)}
                      className={`flex items-center gap-4 p-4 rounded-2xl transition-all ${
                        isActive 
                          ? "bg-primary/10 text-primary" 
                          : "bg-background hover:bg-white/5 text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <div className={`p-2 rounded-xl ${isActive ? "bg-primary/20" : "bg-white/5"}`}>
                        {link.icon}
                      </div>
                      <span className="font-medium">{link.label}</span>
                    </Link>
                  );
                })}

                <button 
                  onClick={() => signOut({ redirectUrl: '/' })}
                  className="w-full flex items-center gap-4 p-4 rounded-2xl bg-destructive/10 text-destructive hover:bg-destructive/20 transition-all mt-4"
                >
                  <div className="p-2 rounded-xl bg-destructive/20">
                    <LogOut className="h-5 w-5" />
                  </div>
                  <span className="font-medium">Sign Out</span>
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
