/**
 * Place cache layer using the existing `places` PostgreSQL table.
 *
 * Before hitting the Google Places API, we check if we already have
 * fresh data for a destination. If the data is less than 7 days old,
 * we return it directly and skip the API call entirely.
 *
 * After fetching new data from Google/Overpass, we upsert into the
 * places table so future requests are instant.
 */

import { db } from "@/db";
import { places } from "@/db/schema";
import { eq, and, gte } from "drizzle-orm";
import { Place } from "./ai-pipeline/types";

const CACHE_TTL_DAYS = 7;

/**
 * Returns cached places for a destination if they exist and are fresh.
 * Returns null if cache miss or data is stale.
 */
export async function getCachedPlaces(destination: string): Promise<Place[] | null> {
  try {
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
      // Too few results to be useful — treat as cache miss
      return null;
    }

    // Map DB rows back to pipeline Place objects
    return cached.map((row) => ({
      id: row.id,
      name: row.name,
      destination: row.destination,
      category: row.category,
      description: row.description || undefined,
      lat: row.lat || undefined,
      lng: row.lng || undefined,
      address: row.address || undefined,
      openingHours: (row.openingHours as Record<string, string>) || undefined,
      estimatedVisitDuration: row.estimatedVisitDuration || undefined,
      estimatedCost: row.estimatedCost ? Number(row.estimatedCost) : undefined,
      rating: row.rating ? Number(row.rating) : undefined,
      imageUrl: row.imageUrl || undefined,
      source: row.source || undefined,
    }));
  } catch (error) {
    console.error("Place cache read error:", error);
    return null;
  }
}

/**
 * Saves discovered places to the DB for future cache hits.
 * Uses upsert-like behavior: inserts only places that don't
 * already exist (by name + destination combo) to avoid duplicates.
 */
export async function cachePlaces(discoveredPlaces: Place[]): Promise<void> {
  if (!discoveredPlaces || discoveredPlaces.length === 0) return;

  try {
    // Fetch existing place names for this destination to deduplicate
    const destination = discoveredPlaces[0].destination;
    const existing = await db
      .select({ name: places.name })
      .from(places)
      .where(eq(places.destination, destination));

    const existingNames = new Set(existing.map((r) => r.name.toLowerCase()));

    // Filter to only truly new places
    const newPlaces = discoveredPlaces.filter(
      (p) => !existingNames.has(p.name.toLowerCase())
    );

    if (newPlaces.length === 0) return;

    // Batch insert (Drizzle handles this efficiently)
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

    console.log(`[PlaceCache] Cached ${newPlaces.length} new places for ${destination}`);
  } catch (error) {
    // Caching failure should never break the pipeline
    console.error("Place cache write error:", error);
  }
}
