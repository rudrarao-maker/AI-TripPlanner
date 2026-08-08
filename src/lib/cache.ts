/**
 * In-memory LRU cache for expensive API calls.
 * Prevents redundant external API calls and DB queries.
 * 
 * For production at scale, replace with Redis cache.
 */

interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

class LRUCache<T = unknown> {
  private cache = new Map<string, CacheEntry<T>>();
  private maxSize: number;

  constructor(maxSize = 500) {
    this.maxSize = maxSize;
  }

  get(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    // Check expiry
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    // Move to end (most recently used)
    this.cache.delete(key);
    this.cache.set(key, entry);
    return entry.data;
  }

  set(key: string, data: T, ttlMs: number): void {
    // Evict oldest if at capacity
    if (this.cache.size >= this.maxSize) {
      const oldestKey = this.cache.keys().next().value;
      if (oldestKey) this.cache.delete(oldestKey);
    }

    this.cache.set(key, {
      data,
      expiresAt: Date.now() + ttlMs,
    });
  }

  has(key: string): boolean {
    return this.get(key) !== null;
  }

  delete(key: string): void {
    this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  get size(): number {
    return this.cache.size;
  }

  /** Remove all expired entries */
  prune(): number {
    let pruned = 0;
    const now = Date.now();
    for (const [key, entry] of this.cache) {
      if (now > entry.expiresAt) {
        this.cache.delete(key);
        pruned++;
      }
    }
    return pruned;
  }
}

// ─── Pre-configured cache instances ──────────────────────────────

/** Cache for external API responses (weather, recommendations, flights) — 15 min TTL */
export const apiCache = new LRUCache(200);
export const API_CACHE_TTL = 15 * 60 * 1000; // 15 minutes

/** Cache for DB query results (destination lists, hotel lists) — 30 min TTL */
export const queryCache = new LRUCache(100);
export const QUERY_CACHE_TTL = 30 * 60 * 1000; // 30 minutes

/** Cache for AI-generated plans (same input → same output) — 1 hour TTL */
export const aiCache = new LRUCache(50);
export const AI_CACHE_TTL = 60 * 60 * 1000; // 1 hour

// ─── Helper: cache-first strategy ────────────────────────────────
export async function cacheFirst<T>(
  cache: LRUCache<T>,
  key: string,
  ttlMs: number,
  fetcher: () => Promise<T>
): Promise<T> {
  const cached = cache.get(key);
  if (cached !== null) return cached;

  const data = await fetcher();
  cache.set(key, data, ttlMs);
  return data;
}

// Run periodic cache cleanup every 5 minutes
if (typeof globalThis !== "undefined") {
  const interval = setInterval(() => {
    apiCache.prune();
    queryCache.prune();
    aiCache.prune();
  }, 5 * 60 * 1000);

  // Don't block Node.js process exit
  if (interval.unref) interval.unref();
}
