import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Utility function to merge tailwind classes safely
 * Uses clsx for conditional classes and tailwind-merge to resolve conflicts
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format currency
 */
export function formatCurrency(
  amount: number,
  currency: string = "INR",
): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Format date to readable string
 */
export function formatDate(dateString: string): string {
  if (!dateString) return "";
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

/**
 * Calculate duration between two dates in days
 */
export function calculateDuration(startDate: string, endDate: string): number {
  if (!startDate || !endDate) return 0;
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.abs(end.getTime() - start.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays + 1; // Inclusive of start day
}

/**
 * Generate a random fallback avatar based on name
 */
export function generateAvatar(name: string): string {
  const seed = encodeURIComponent(name);
  return `https://api.dicebear.com/7.x/initials/svg?seed=${seed}&backgroundColor=0f172a,3b82f6,6366f1,8b5cf6&textColor=ffffff`;
}
