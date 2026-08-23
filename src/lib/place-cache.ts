/**
 * Place cache layer using Upstash Redis (Edge) + PostgreSQL.
 *
 * Before hitting the Google Places API, we check Redis for instant responses.
 * If Redis misses, we check PostgreSQL (fresh data < 7 days).
 * After fetching new data, we cache it in both Redis and PostgreSQL.
 */

import { db } from "@/db";
import { places } from "@/db/schema";
import { eq, and, gte } from "drizzle-orm";
import { Place } from "./ai-pipeline/types";
import { redis } from "./redis";

const CACHE_TTL_DAYS = 7;
const REDIS_TTL_SECONDS = 7 * 24 * 60 * 60; // 7 days

export async function getCachedPlaces(destination: string): Promise<Place[] | null> {
  const cacheKey = `places:${destination.toLowerCase()}`;

  try {
    // 1. Try Redis Edge Cache First (Fastest)
    if (redis) {
      const redisCached = await redis.get<Place[]>(cacheKey);
      if (redisCached && redisCached.length >= 5) {
        console.log(`[PlaceCache] Redis cache hit for ${destination}`);
        return redisCached;
      }
    }

    // 2. Fallback to PostgreSQL
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - CACHE_TTL_DAYS);

    const cached = await db
      .select()
      .from(places)
      .where(
        and(
          eq(places.destination, destination),
          gte(places.createdAt, cutoff)
        )
      );

    if (!cached || cached.length < 5) {
      return null;
    }

    // Map DB rows back to pipeline Place objects
    const mappedPlaces: Place[] = cached.map((row) => ({
      id: row.id,
      name: row.name,
      destination: row.destination,
      category: row.category,
      description: row.description || undefined,
      lat: row.lat !== null ? row.lat : undefined,
      lng: row.lng !== null ? row.lng : undefined,
      address: row.address || undefined,
      openingHours: (row.openingHours as Record<string, string>) || undefined,
      estimatedVisitDuration: row.estimatedVisitDuration || undefined,
      estimatedCost: row.estimatedCost ? Number(row.estimatedCost) : undefined,
      rating: row.rating ? Number(row.rating) : undefined,
      imageUrl: row.imageUrl || undefined,
      source: row.source || undefined,
    }));

    // Backfill Redis
    if (redis) {
      await redis.setex(cacheKey, REDIS_TTL_SECONDS, mappedPlaces).catch(console.error);
    }

    console.log(`[PlaceCache] PostgreSQL cache hit for ${destination}`);
    return mappedPlaces;
  } catch (error) {
    console.error("Place cache read error:", error);
    return null;
  }
}

export async function cachePlaces(discoveredPlaces: Place[]): Promise<void> {
  if (!discoveredPlaces || discoveredPlaces.length === 0) return;

  try {
    const destination = discoveredPlaces[0].destination;
    const cacheKey = `places:${destination.toLowerCase()}`;

    // 1. Write to Redis immediately
    if (redis) {
      await redis.setex(cacheKey, REDIS_TTL_SECONDS, discoveredPlaces).catch(console.error);
    }

    // 2. Background write to PostgreSQL
    const existing = await db
      .select({ name: places.name })
      .from(places)
      .where(eq(places.destination, destination));

    const existingNames = new Set(existing.map((r) => r.name.toLowerCase()));

    const newPlaces = discoveredPlaces.filter(
      (p) => !existingNames.has(p.name.toLowerCase())
    );

    if (newPlaces.length > 0) {
      await db.insert(places).values(
        newPlaces.map((p) => ({
          name: p.name,
          destination: p.destination,
          category: p.category,
          description: p.description || null,
          lat: p.lat || null,
          lng: p.lng || null,
          address: p.address || null,
          openingHours: p.openingHours || null,
          estimatedVisitDuration: p.estimatedVisitDuration || null,
          estimatedCost: p.estimatedCost?.toString() || null,
          rating: p.rating?.toString() || null,
          imageUrl: p.imageUrl || null,
          source: p.source || null,
        }))
      );
      console.log(`[PlaceCache] Cached ${newPlaces.length} new places to PostgreSQL for ${destination}`);
    }
  } catch (error) {
    console.error("Place cache write error:", error);
  }
}
