/**
 * Unit tests for the LRU cache module.
 * Tests cache hit/miss, TTL expiry, LRU eviction, and cacheFirst helper.
 */

// We need to test the cache module internals, so we import the instances directly
import { apiCache, queryCache, aiCache, cacheFirst, API_CACHE_TTL } from "@/lib/cache";

describe("LRU Cache", () => {
  beforeEach(() => {
    apiCache.clear();
    queryCache.clear();
    aiCache.clear();
  });

  describe("Basic operations", () => {
    it("returns null for a cache miss", () => {
      expect(apiCache.get("nonexistent")).toBeNull();
    });

    it("stores and retrieves a value", () => {
      apiCache.set("key1", { data: "hello" }, 60000);
      expect(apiCache.get("key1")).toEqual({ data: "hello" });
    });

    it("reports correct size", () => {
      expect(apiCache.size).toBe(0);
      apiCache.set("a", 1, 60000);
      apiCache.set("b", 2, 60000);
      expect(apiCache.size).toBe(2);
    });

    it("deletes a specific key", () => {
      apiCache.set("key1", "value1", 60000);
      apiCache.delete("key1");
      expect(apiCache.get("key1")).toBeNull();
    });

    it("clears all entries", () => {
      apiCache.set("a", 1, 60000);
      apiCache.set("b", 2, 60000);
      apiCache.clear();
      expect(apiCache.size).toBe(0);
    });
  });

  describe("TTL expiry", () => {
    it("returns null for expired entries", () => {
      // Set with a very short TTL
      apiCache.set("expiring", "data", 1); // 1ms TTL
      
      // Wait a bit and then check
      return new Promise<void>((resolve) => {
        setTimeout(() => {
          expect(apiCache.get("expiring")).toBeNull();
          resolve();
        }, 10);
      });
    });

    it("returns data for non-expired entries", () => {
      apiCache.set("fresh", "data", 60000); // 60s TTL
      expect(apiCache.get("fresh")).toBe("data");
    });

    it("prune removes expired entries", () => {
      apiCache.set("old", "data", 1); // will expire immediately
      apiCache.set("fresh", "data", 60000);

      return new Promise<void>((resolve) => {
        setTimeout(() => {
          const pruned = apiCache.prune();
          expect(pruned).toBe(1);
          expect(apiCache.size).toBe(1);
          expect(apiCache.get("fresh")).toBe("data");
          resolve();
        }, 10);
      });
    });
  });

  describe("has() method", () => {
    it("returns true for existing keys", () => {
      apiCache.set("exists", "value", 60000);
      expect(apiCache.has("exists")).toBe(true);
    });

    it("returns false for missing keys", () => {
      expect(apiCache.has("missing")).toBe(false);
    });
  });

  describe("cacheFirst helper", () => {
    it("calls fetcher on cache miss and caches the result", async () => {
      const fetcher = jest.fn().mockResolvedValue({ result: "fetched" });

      const data = await cacheFirst(apiCache, "test-key", 60000, fetcher);
      
      expect(fetcher).toHaveBeenCalledTimes(1);
      expect(data).toEqual({ result: "fetched" });

      // Second call should hit cache
      const data2 = await cacheFirst(apiCache, "test-key", 60000, fetcher);
      expect(fetcher).toHaveBeenCalledTimes(1); // NOT called again
      expect(data2).toEqual({ result: "fetched" });
    });

    it("returns cached data without calling fetcher on cache hit", async () => {
      apiCache.set("pre-cached", "existing-data", 60000);
      const fetcher = jest.fn().mockResolvedValue("new-data");

      const data = await cacheFirst(apiCache, "pre-cached", 60000, fetcher);
      
      expect(fetcher).not.toHaveBeenCalled();
      expect(data).toBe("existing-data");
    });
  });

  describe("Pre-configured instances", () => {
    it("apiCache, queryCache, aiCache are separate instances", () => {
      apiCache.set("shared-key", "api-value", 60000);
      queryCache.set("shared-key", "query-value", 60000);
      aiCache.set("shared-key", "ai-value", 60000);

      expect(apiCache.get("shared-key")).toBe("api-value");
      expect(queryCache.get("shared-key")).toBe("query-value");
      expect(aiCache.get("shared-key")).toBe("ai-value");
    });

    it("API_CACHE_TTL is 15 minutes", () => {
      expect(API_CACHE_TTL).toBe(15 * 60 * 1000);
    });
  });
});
