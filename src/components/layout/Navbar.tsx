"use client";
import { useState, useEffect } from "react";
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Logo } from "../common/Logo";
import { Button } from "../ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { NAV_LINKS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { useAuth, useUser, SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";

export function Navbar({ dbIsAdmin = false }: { dbIsAdmin?: boolean }) {
  const [isScrolled, setIsScrolled] = useState(false);
  const pathname = usePathname();
  const { isSignedIn } = useAuth();
  const { user } = useUser();
  const isClerkAdmin = user?.publicMetadata?.role === "admin" || user?.publicMetadata?.role === "super_admin";
  const isAdmin = dbIsAdmin || isClerkAdmin;

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
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

        {/* Desktop Navigation — unchanged */}
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
            {isSignedIn && (
              <>
                {!isAdmin && (
                  <Link
                    href="/dashboard"
                    className={cn(
                      "text-sm font-medium transition-all duration-200 px-3.5 py-2 rounded-full whitespace-nowrap",
                      pathname.startsWith("/dashboard")
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground hover:bg-background/60",
                    )}
                  >
                    Dashboard
                  </Link>
                )}
                {isAdmin && (
                  <Link
                    href="/admin"
                    className={cn(
                      "text-sm font-medium transition-all duration-200 px-3.5 py-2 rounded-full whitespace-nowrap",
                      pathname.startsWith("/admin")
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground hover:bg-background/60",
                    )}
                  >
                    Admin Panel
                  </Link>
                )}
              </>
            )}
          </div>
        </nav>

        {/* Desktop Right Side Actions */}
        <div className="hidden lg:flex items-center gap-3">
          <ThemeToggle />
          {isSignedIn ? (
            <UserButton
              appearance={{
                elements: {
                  userButtonAvatarBox: "w-10 h-10"
                }
              }}
            />
          ) : (
            <div className="flex items-center gap-2">
              <SignInButton mode="modal" fallbackRedirectUrl="/admin">
                <Button variant="ghost" className="rounded-full px-5">Log in</Button>
              </SignInButton>
              <SignUpButton mode="modal" fallbackRedirectUrl="/admin">
                <Button variant="gradient" className="rounded-full shadow-lg px-5">Sign up</Button>
              </SignUpButton>
            </div>
          )}
        </div>

        {/* Mobile Top Bar — simplified (bottom nav handles navigation) */}
        <div className="flex items-center gap-2 lg:hidden">
          <ThemeToggle />
          {isSignedIn ? (
            <UserButton
              appearance={{
                elements: {
                  userButtonAvatarBox: "w-8 h-8"
                }
              }}
            />
          ) : (
            <SignInButton mode="modal" fallbackRedirectUrl="/dashboard">
              <Button variant="default" size="sm" className="rounded-full px-4 h-8 text-xs font-semibold">
                Sign in
              </Button>
            </SignInButton>
          )}
        </div>
      </div>
    </header>
  );
}
