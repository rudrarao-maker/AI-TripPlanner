"use client";
import Link from 'next/link';
import Image from 'next/image';
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
    <Link href="/" className={cn("flex items-center gap-2 group", className)}>
      <div
        className={cn(
          "relative flex items-center justify-center transition-transform group-hover:scale-[1.02] overflow-hidden rounded-md",
          iconClassName || "h-10 w-10 md:h-12 md:w-12"
        )}
      >
        {/* We use next/image to render the new logo */}
        <Image
          src="/logo.jpg"
          alt="Trip Craft AI Logo"
          fill
          className="object-contain mix-blend-multiply dark:mix-blend-screen"
        />
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
