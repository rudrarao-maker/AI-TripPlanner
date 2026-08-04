"use client";
import { useState, useEffect } from "react";
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Menu,
  X,
} from "lucide-react";
import { Logo } from "../common/Logo";
import { Button } from "../ui/button";
import { NAV_LINKS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { useAuth, SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const { isSignedIn } = useAuth();

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
  }, [pathname]);

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
              <Link key={link.path}
                href={link.path}
                className={cn(
                  "text-sm font-medium transition-all duration-200 px-3.5 py-2 rounded-full whitespace-nowrap",
                  pathname === link.path
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
          {isSignedIn ? (
            <UserButton 
              appearance={{
                elements: {
                  userButtonAvatarBox: "w-9 h-9 border-2 border-background shadow-sm"
                }
              }}
              afterSignOutUrl="/"
            />
          ) : (
            <div className="flex items-center gap-2">
              <SignInButton mode="modal">
                <Button variant="ghost" className="rounded-full px-5">Log in</Button>
              </SignInButton>
              <SignUpButton mode="modal">
                <Button variant="gradient" className="rounded-full shadow-lg px-5">Sign up</Button>
              </SignUpButton>
            </div>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <div className="flex items-center gap-3 lg:hidden">
          {isSignedIn && (
            <UserButton afterSignOutUrl="/" />
          )}

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
              <Link key={link.path}
                href={link.path}
                className={cn(
                  "text-base font-medium py-3 px-4 rounded-xl transition-all duration-200",
                  pathname === link.path
                    ? "bg-primary/10 text-primary font-semibold"
                    : "text-foreground hover:bg-muted/60",
                )}
              >
                {link.label}
              </Link>
            ))}

            <hr className="my-3 border-border/50" />
            <div className="flex flex-col gap-1 py-4 border-t mt-2">
              {!isSignedIn && (
                <div className="flex flex-col gap-2 px-2">
                  <SignInButton mode="modal">
                    <Button variant="outline" className="w-full rounded-xl">Log in</Button>
                  </SignInButton>
                  <SignUpButton mode="modal">
                    <Button variant="gradient" className="w-full rounded-xl">Sign up</Button>
                  </SignUpButton>
                </div>
              )}
              {isSignedIn && (
                <div className="px-4 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Account
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
