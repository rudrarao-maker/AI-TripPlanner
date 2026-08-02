import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Menu,
  X,
  User as UserIcon,
  ChevronDown,
  Heart,
  Map,
  Receipt,
  BookOpen,
  LogOut,
  Shield,
  Settings,
  LayoutDashboard,
} from "lucide-react";
import { Logo } from "../common/Logo";
import { ThemeToggle } from "../common/ThemeToggle";
import { Button } from "../ui/button";
import { useUser, useClerk } from "@clerk/clerk-react";
import { NAV_LINKS, USER_NAV_LINKS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const { user, isSignedIn: isAuthenticated } = useUser();
  const { signOut: logout } = useClerk();
  const location = useLocation();
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsUserMenuOpen(false);
  }, [location.pathname]);

  // Close user menu on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(event.target as Node)
      ) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-500 border-b",
        isScrolled
          ? "bg-background/80 backdrop-blur-xl border-border/50 shadow-[0_4px_30px_rgba(0,0,0,0.06)] py-2"
          : "bg-background/50 backdrop-blur-md border-transparent py-4",
      )}
    >
      <div className="container mx-auto px-4 md:px-6 flex items-center justify-between">
        <Logo />

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-1">
          <div className="flex items-center gap-0.5 bg-muted/40 backdrop-blur-sm rounded-full px-1.5 py-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={cn(
                  "text-sm font-medium transition-all duration-200 px-3.5 py-2 rounded-full whitespace-nowrap",
                  location.pathname === link.path
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground hover:bg-background/60",
                )}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </nav>

        {/* Right Side Actions */}
        <div className="hidden lg:flex items-center gap-3">
          <ThemeToggle />

          {isAuthenticated ? (
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-2 hover:bg-muted/50 p-1.5 rounded-full transition-colors"
                aria-label="Toggle user menu"
                aria-expanded={isUserMenuOpen}
              >
                <div className="h-9 w-9 rounded-full bg-gradient-to-br from-primary to-accent overflow-hidden border-2 border-background shadow-sm flex items-center justify-center">
                  {user?.imageUrl ? (
                    <img
                      src={user.imageUrl}
                      alt={user.fullName || user.firstName || "User"}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <UserIcon className="h-5 w-5 text-white" aria-hidden="true" />
                  )}
                </div>
              </button>

              <AnimatePresence>
                {isUserMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="absolute right-0 top-full mt-2 w-64 bg-background/95 backdrop-blur-xl border shadow-2xl rounded-2xl overflow-hidden py-2 z-50"
                  >
                    <div className="px-4 py-3 border-b border-border/50 bg-muted/20">
                      <p className="font-semibold text-sm truncate">
                        {user?.fullName || user?.firstName}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {user?.primaryEmailAddress?.emailAddress}
                      </p>
                    </div>
                    <div className="p-2 flex flex-col gap-1">
                      <Link
                        to="/dashboard"
                        className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm hover:bg-primary/10 hover:text-primary transition-colors"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <LayoutDashboard className="h-4 w-4" /> Dashboard
                      </Link>
                      <Link
                        to="/my-trips"
                        className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm hover:bg-primary/10 hover:text-primary transition-colors"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <Map className="h-4 w-4" /> My Trips
                      </Link>
                      <Link
                        to="/wishlist"
                        className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm hover:bg-primary/10 hover:text-primary transition-colors"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <Heart className="h-4 w-4" /> Wishlist
                      </Link>
                      <Link
                        to="/expenses"
                        className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm hover:bg-primary/10 hover:text-primary transition-colors"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <Receipt className="h-4 w-4" /> Expenses
                      </Link>
                      <Link
                        to="/admin"
                        className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm hover:bg-primary/10 hover:text-primary transition-colors"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <Shield className="h-4 w-4" /> Admin Panel
                      </Link>
                    </div>
                    <div className="p-2 border-t border-border/50 mt-1">
                      <button
                        onClick={() => {
                          logout();
                          setIsUserMenuOpen(false);
                        }}
                        className="flex w-full items-center gap-3 px-3 py-2 rounded-xl text-sm text-destructive hover:bg-destructive/10 transition-colors"
                      >
                        <LogOut className="h-4 w-4" /> Logout
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Button variant="ghost" className="rounded-full px-5" asChild>
                <Link to="/login">Log in</Link>
              </Button>
              <Button
                variant="gradient"
                className="rounded-full shadow-lg px-5"
                asChild
              >
                <Link to="/register">Sign up</Link>
              </Button>
            </div>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <div className="flex items-center gap-3 lg:hidden">
          <ThemeToggle />
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="text-foreground focus:outline-none p-2 rounded-xl hover:bg-muted/60 transition-colors"
            aria-label="Toggle mobile menu"
            aria-expanded={isMobileMenuOpen}
          >
            {isMobileMenuOpen ? (
              <X className="h-6 w-6" aria-hidden="true" />
            ) : (
              <Menu className="h-6 w-6" aria-hidden="true" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMobileMenuOpen && (
        <div className="lg:hidden absolute top-full left-0 right-0 bg-background/95 backdrop-blur-xl border-b border-border shadow-2xl py-4 px-4 animate-slide-down max-h-[80vh] overflow-y-auto">
          <div className="flex flex-col gap-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={cn(
                  "text-base font-medium py-3 px-4 rounded-xl transition-all duration-200",
                  location.pathname === link.path
                    ? "bg-primary/10 text-primary font-semibold"
                    : "text-foreground hover:bg-muted/60",
                )}
              >
                {link.label}
              </Link>
            ))}

            <hr className="my-3 border-border/50" />

            <div className="flex flex-col gap-1 py-4 border-t mt-2">
              {isAuthenticated ? (
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-3 py-3 px-4 mb-2">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary to-accent overflow-hidden border-2 border-background flex items-center justify-center">
                      {user?.imageUrl ? (
                        <img
                          src={user.imageUrl}
                          alt={user.fullName || user.firstName || "User"}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <UserIcon className="h-5 w-5 text-white" />
                      )}
                    </div>
                    <div>
                      <p className="font-bold text-sm">{user?.fullName || user?.firstName}</p>
                      <p className="text-xs text-muted-foreground">
                        {user?.primaryEmailAddress?.emailAddress}
                      </p>
                    </div>
                  </div>
                  <div className="px-4 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Account
                  </div>
                  <Link
                    to="/dashboard"
                    className="flex items-center gap-3 py-2.5 px-4 rounded-xl hover:bg-muted/60 transition-colors text-sm font-medium"
                  >
                    <LayoutDashboard className="h-4 w-4 text-primary" />{" "}
                    Dashboard
                  </Link>
                  <Link
                    to="/my-trips"
                    className="flex items-center gap-3 py-2.5 px-4 rounded-xl hover:bg-muted/60 transition-colors text-sm font-medium"
                  >
                    <Map className="h-4 w-4 text-primary" /> My Trips
                  </Link>
                  <Link
                    to="/wishlist"
                    className="flex items-center gap-3 py-2.5 px-4 rounded-xl hover:bg-muted/60 transition-colors text-sm font-medium"
                  >
                    <Heart className="h-4 w-4 text-rose-500" /> Wishlist
                  </Link>
                  <Link
                    to="/expenses"
                    className="flex items-center gap-3 py-2.5 px-4 rounded-xl hover:bg-muted/60 transition-colors text-sm font-medium"
                  >
                    <Receipt className="h-4 w-4 text-amber-500" /> Expenses
                  </Link>
                  <Link
                    to="/admin"
                    className="flex items-center gap-3 py-2.5 px-4 rounded-xl hover:bg-muted/60 transition-colors text-sm font-medium"
                  >
                    <Shield className="h-4 w-4 text-primary" /> Admin Panel
                  </Link>
                  <Button
                    variant="destructive"
                    className="w-full justify-start mt-2 rounded-xl"
                    onClick={() => logout()}
                  >
                    <LogOut className="h-4 w-4 mr-2" /> Logout
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col gap-2 px-2">
                  <Button
                    variant="outline"
                    className="w-full rounded-xl"
                    asChild
                  >
                    <Link to="/login">Log in</Link>
                  </Button>
                  <Button
                    variant="gradient"
                    className="w-full rounded-xl"
                    asChild
                  >
                    <Link to="/register">Sign up</Link>
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
