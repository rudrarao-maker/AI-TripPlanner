import { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, User as UserIcon, ChevronDown, Heart, Map, Receipt, BookOpen, LogOut, Shield, Settings } from 'lucide-react';
import { Logo } from '../common/Logo';
import { ThemeToggle } from '../common/ThemeToggle';
import { Button } from '../ui/button';
import { useAuthStore } from '@/store/authStore';
import { NAV_LINKS, USER_NAV_LINKS } from '@/lib/constants';
import { cn } from '@/lib/utils';

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const location = useLocation();
  const { isAuthenticated, user, logout } = useAuthStore();
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsUserMenuOpen(false);
  }, [location.pathname]);

  // Close user menu on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-500 border-b",
        isScrolled 
          ? "bg-background/80 backdrop-blur-xl border-border/50 shadow-[0_4px_30px_rgba(0,0,0,0.06)] py-2" 
          : "bg-background/50 backdrop-blur-md border-transparent py-4"
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
                    : "text-muted-foreground hover:text-foreground hover:bg-background/60"
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
                className={cn(
                  "flex items-center gap-2.5 px-3 py-2 rounded-full transition-all duration-200",
                  "hover:bg-muted/60 border border-transparent",
                  isUserMenuOpen && "bg-muted/60 border-border/50"
                )}
              >
                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary to-accent overflow-hidden border-2 border-background shadow-sm flex items-center justify-center">
                  {user?.avatar ? (
                    <img src={user.avatar} alt={user.name} className="h-full w-full object-cover" />
                  ) : (
                    <UserIcon className="h-4 w-4 text-white" />
                  )}
                </div>
                <span className="text-sm font-semibold hidden xl:inline-block max-w-[100px] truncate">{user?.name?.split(' ')[0]}</span>
                <ChevronDown className={cn("h-4 w-4 text-muted-foreground transition-transform duration-200", isUserMenuOpen && "rotate-180")} />
              </button>

              {/* User Dropdown */}
              {isUserMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-72 bg-card/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-border/60 overflow-hidden animate-slide-down z-50">
                  {/* User Info */}
                  <div className="p-4 border-b border-border/50 bg-muted/30">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-full bg-gradient-to-br from-primary to-accent overflow-hidden border-2 border-background shadow-md flex items-center justify-center">
                        {user?.avatar ? (
                          <img src={user.avatar} alt={user.name} className="h-full w-full object-cover" />
                        ) : (
                          <UserIcon className="h-6 w-6 text-white" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-sm truncate">{user?.name}</p>
                        <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                      </div>
                    </div>
                  </div>

                  {/* Navigation Items */}
                  <div className="p-2">
                    <Link to="/dashboard" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium hover:bg-muted/60 transition-colors">
                      <Map className="h-4 w-4 text-primary" />
                      <span>My Trips</span>
                    </Link>
                    <Link to="/wishlist" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium hover:bg-muted/60 transition-colors">
                      <Heart className="h-4 w-4 text-rose-500" />
                      <span>Wishlist</span>
                    </Link>
                    <Link to="/expenses" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium hover:bg-muted/60 transition-colors">
                      <Receipt className="h-4 w-4 text-amber-500" />
                      <span>Expenses</span>
                    </Link>
                    <Link to="/journal" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium hover:bg-muted/60 transition-colors">
                      <BookOpen className="h-4 w-4 text-emerald-500" />
                      <span>Travel Journal</span>
                    </Link>
                    <Link to="/bookings" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium hover:bg-muted/60 transition-colors">
                      <Settings className="h-4 w-4 text-muted-foreground" />
                      <span>Bookings</span>
                    </Link>
                    <Link to="/security" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium hover:bg-muted/60 transition-colors">
                      <Shield className="h-4 w-4 text-green-500" />
                      <span>Security</span>
                    </Link>
                  </div>

                  {/* Logout */}
                  <div className="p-2 pt-0 border-t border-border/50 mt-1">
                    <button
                      onClick={logout}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium hover:bg-destructive/10 text-destructive transition-colors w-full"
                    >
                      <LogOut className="h-4 w-4" />
                      <span>Logout</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Button variant="ghost" className="rounded-full" asChild>
                <Link to="/login">Log in</Link>
              </Button>
              <Button variant="gradient" className="rounded-full shadow-lg shadow-primary/20" asChild>
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
          >
            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
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
                    : "text-foreground hover:bg-muted/60"
                )}
              >
                {link.label}
              </Link>
            ))}
            
            <hr className="my-3 border-border/50" />
            
            {isAuthenticated ? (
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-3 py-3 px-4 mb-2">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary to-accent overflow-hidden border-2 border-background flex items-center justify-center">
                    {user?.avatar ? (
                      <img src={user.avatar} alt={user.name} className="h-full w-full object-cover" />
                    ) : (
                      <UserIcon className="h-5 w-5 text-white" />
                    )}
                  </div>
                  <div>
                    <p className="font-bold text-sm">{user?.name}</p>
                    <p className="text-xs text-muted-foreground">{user?.email}</p>
                  </div>
                </div>
                <Link to="/dashboard" className="flex items-center gap-3 py-2.5 px-4 rounded-xl hover:bg-muted/60 transition-colors text-sm font-medium">
                  <Map className="h-4 w-4 text-primary" /> My Trips
                </Link>
                <Link to="/wishlist" className="flex items-center gap-3 py-2.5 px-4 rounded-xl hover:bg-muted/60 transition-colors text-sm font-medium">
                  <Heart className="h-4 w-4 text-rose-500" /> Wishlist
                </Link>
                <Link to="/expenses" className="flex items-center gap-3 py-2.5 px-4 rounded-xl hover:bg-muted/60 transition-colors text-sm font-medium">
                  <Receipt className="h-4 w-4 text-amber-500" /> Expenses
                </Link>
                <Button variant="destructive" className="w-full justify-start mt-2 rounded-xl" onClick={logout}>
                  <LogOut className="h-4 w-4 mr-2" /> Logout
                </Button>
              </div>
            ) : (
              <div className="flex flex-col gap-2 px-2">
                <Button variant="outline" className="w-full rounded-xl" asChild>
                  <Link to="/login">Log in</Link>
                </Button>
                <Button variant="gradient" className="w-full rounded-xl" asChild>
                  <Link to="/register">Sign up</Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
