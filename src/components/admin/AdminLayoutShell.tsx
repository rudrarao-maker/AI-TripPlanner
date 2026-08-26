"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  Users,
  Map,
  Building2,
  UtensilsCrossed,
  Compass,
  CreditCard,
  Star,
  Bot,
  Settings,
  Bell,
  Menu,
  X,
  LogOut,
  Search,
  ShieldAlert
} from "lucide-react";
import { useClerk } from "@clerk/nextjs";
import { MobileBottomNav } from "./MobileBottomNav";

const ADMIN_LINKS = [
  { href: "/admin", label: "Overview", icon: <LayoutDashboard className="h-5 w-5" /> },
  { href: "/admin/users", label: "Users", icon: <Users className="h-5 w-5" /> },
  { href: "/admin/trips", label: "Trips", icon: <Map className="h-5 w-5" /> },
  { href: "/admin/bookings", label: "Bookings", icon: <CreditCard className="h-5 w-5" /> },
  { href: "/admin/destinations", label: "Destinations", icon: <Compass className="h-5 w-5" /> },
  { href: "/admin/hotels", label: "Hotels", icon: <Building2 className="h-5 w-5" /> },
  { href: "/admin/payments", label: "Payments", icon: <CreditCard className="h-5 w-5" /> },
  { href: "/admin/ai", label: "AI Management", icon: <Bot className="h-5 w-5" /> },
  { href: "/admin/audit-logs", label: "Audit Logs", icon: <ShieldAlert className="h-5 w-5" /> },
  { href: "/admin/settings", label: "Settings", icon: <Settings className="h-5 w-5" /> },
];

export function AdminLayoutShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const { signOut } = useClerk();

  // Handle Command Palette shortcut (Cmd+K or Ctrl+K)
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setIsCommandPaletteOpen((open) => !open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  return (
    <div className="min-h-screen bg-background flex pb-20 lg:pb-0">
      {/* Sidebar - Desktop Only */}
      <aside className="w-72 fixed inset-y-0 left-0 z-50 flex-col glass border-r border-white/5 backdrop-blur-2xl bg-background/95 pt-0 hidden lg:flex">
        <div className="p-6 pt-8 flex-1 overflow-y-auto">
          <div className="flex items-center justify-between mb-8 px-2">
            <Link href="/admin" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg">
                <Bot className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="font-bold text-lg leading-tight">Admin Portal</h2>
                <p className="text-xs text-muted-foreground">Enterprise Panel</p>
              </div>
            </Link>

          </div>

          <nav className="space-y-1" role="navigation" aria-label="Admin Navigation">
            {ADMIN_LINKS.map((tab) => {
              const isActive = pathname === tab.href || (pathname.startsWith(tab.href) && tab.href !== '/admin');
              return (
                <Link
                  key={tab.href}
                  href={tab.href}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? "bg-primary/10 text-primary shadow-sm"
                      : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
                  }`}
                >
                  {tab.icon}
                  {tab.label}
                </Link>
              );
            })}
          </nav>
        </div>
        
        <div className="mt-auto p-6 border-t border-white/5">
          <Button 
            variant="ghost" 
            className="w-full justify-start gap-3 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-xl"
            onClick={() => signOut({ redirectUrl: '/' })}
          >
            <LogOut className="h-5 w-5" /> Sign Out
          </Button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 lg:ml-72 min-h-screen w-full flex flex-col">
        {/* Top Header */}
        <header className="h-16 border-b border-white/5 bg-background/40 backdrop-blur-md flex items-center justify-between px-4 sm:px-8 sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
               {/* Breadcrumbs */}
               <span className="text-sm font-medium text-muted-foreground capitalize">
                 {pathname === "/admin" ? "Overview" : pathname.split("/").pop()?.replace(/-/g, ' ')}
               </span>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <Button 
              variant="outline" 
              className="hidden sm:flex items-center gap-2 text-muted-foreground rounded-full w-64 justify-start bg-background/50 border-white/10"
              onClick={() => setIsCommandPaletteOpen(true)}
            >
              <Search className="h-4 w-4" />
              <span>Search everything...</span>
              <kbd className="ml-auto pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border border-border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
                <span className="text-xs">⌘</span>K
              </kbd>
            </Button>
            <Button variant="ghost" size="icon" className="rounded-full relative">
              <Bell className="h-5 w-5 text-muted-foreground" />
              <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-primary" />
            </Button>
          </div>
        </header>

        {/* Dynamic Content */}
        <div className="flex-1 p-4 sm:p-8 max-w-7xl mx-auto w-full">
          {children}
        </div>
      </main>

      {/* Command Palette Modal */}
      <AnimatePresence>
        {isCommandPaletteOpen && (
          <div className="fixed inset-0 z-50 flex items-start justify-center pt-32">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-background/80 backdrop-blur-sm"
              onClick={() => setIsCommandPaletteOpen(false)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              className="relative w-full max-w-lg bg-card border border-border rounded-xl shadow-2xl overflow-hidden"
            >
              <div className="flex items-center px-4 py-3 border-b border-border">
                <Search className="h-5 w-5 text-muted-foreground mr-3" />
                <input 
                  autoFocus
                  placeholder="Type a command or search..."
                  className="flex-1 bg-transparent border-none outline-none text-foreground placeholder:text-muted-foreground"
                />
              </div>
              <div className="p-2 space-y-1">
                <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">Quick Actions</div>
                <Link href="/admin/users" className="flex items-center px-3 py-2 text-sm rounded-md hover:bg-accent hover:text-accent-foreground" onClick={() => setIsCommandPaletteOpen(false)}>
                  <Users className="h-4 w-4 mr-2" /> Manage Users
                </Link>
                <Link href="/admin/trips" className="flex items-center px-3 py-2 text-sm rounded-md hover:bg-accent hover:text-accent-foreground" onClick={() => setIsCommandPaletteOpen(false)}>
                  <Map className="h-4 w-4 mr-2" /> View Trips
                </Link>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav />
    </div>
  );
}
