import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const isRedisConfigured = 
  process.env.UPSTASH_REDIS_REST_URL && 
  process.env.UPSTASH_REDIS_REST_URL !== "https://dummy-upstash.upstash.io";

const redis = isRedisConfigured ? Redis.fromEnv() : null;

// Create a new ratelimiter, that allows 10 requests per 1 day (or null if disabled)
export const ratelimit = redis 
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(10, "1 d"),
      analytics: true,
    })
  : null;
