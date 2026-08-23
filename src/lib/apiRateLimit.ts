import { Ratelimit } from "@upstash/ratelimit";
import { redis } from "./redis";

// ─── Pre-configured rate limiters by tier ─────────────────────────

/** AI generation: 10 requests per day per user */
export const aiGenerateLimit = redis
  ? new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(10, "1 d"), analytics: true, prefix: "rl:ai-gen" })
  : null;

/** AI chat: 20 requests per hour per user */
export const aiChatLimit = redis
  ? new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(20, "1 h"), analytics: true, prefix: "rl:ai-chat" })
  : null;

/** Trip save: 30 requests per day per user */
export const tripSaveLimit = redis
  ? new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(30, "1 d"), analytics: true, prefix: "rl:trip-save" })
  : null;

/** General API: 60 requests per minute per user */
export const generalApiLimit = redis
  ? new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(60, "1 m"), analytics: true, prefix: "rl:general" })
  : null;

/** Public endpoints (newsletter etc): 5 per hour per IP */
export const publicLimit = redis
  ? new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(5, "1 h"), analytics: true, prefix: "rl:public" })
  : null;

/** Admin API: 100 requests per minute per admin */
export const adminApiLimit = redis
  ? new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(100, "1 m"), analytics: true, prefix: "rl:admin" })
  : null;

// ─── Helper: apply rate limit or skip gracefully ──────────────────
export async function applyRateLimit(
  limiter: Ratelimit | null,
  identifier: string
): Promise<{ allowed: true } | { allowed: false; headers: Record<string, string> }> {
  if (!limiter) return { allowed: true }; // Skip if Redis not configured

  const { success, limit, reset, remaining } = await limiter.limit(identifier);

  if (!success) {
    return {
      allowed: false,
      headers: {
        "X-RateLimit-Limit": limit.toString(),
        "X-RateLimit-Remaining": remaining.toString(),
        "X-RateLimit-Reset": reset.toString(),
        "Retry-After": Math.ceil((reset - Date.now()) / 1000).toString(),
      },
    };
  }

  return { allowed: true };
}
