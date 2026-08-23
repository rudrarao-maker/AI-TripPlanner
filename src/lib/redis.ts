import { Redis } from "@upstash/redis";

export const isRedisConfigured = 
  process.env.UPSTASH_REDIS_REST_URL && 
  process.env.UPSTASH_REDIS_REST_URL !== "https://dummy-upstash.upstash.io";

export const redis = isRedisConfigured ? Redis.fromEnv() : null;
