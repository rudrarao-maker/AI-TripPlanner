import { PipelineState, Place } from "./types";
import { fetchGooglePlaces } from "../google-places";
import { getCachedPlaces, cachePlaces } from "../place-cache";

export class PlaceDiscoveryService {
  static async discover(state: PipelineState): Promise<PipelineState> {
    const { destination, interests = [] } = state.preferences;
    let places: Place[] = [];

    // ── Step 1: Check DB cache ──────────────────────────────────
    try {
      const cached = await getCachedPlaces(destination);
      if (cached && cached.length >= 5) {
        console.log(`[PlaceDiscovery] Cache HIT for ${destination} (${cached.length} places)`);
        return {
          ...state,
          discoveredPlaces: cached,
        };
      }
    } catch (error) {
      console.warn("[PlaceDiscovery] Cache check failed, proceeding to live APIs:", error);
    }

    // ── Step 2: Try Google Places API (primary source) ──────────
    try {
      console.log(`[PlaceDiscovery] Fetching from Google Places API for ${destination}...`);
      places = await fetchGooglePlaces(destination, interests, 50);
      console.log(`[PlaceDiscovery] Google Places returned ${places.length} results`);

      if (places.length > 0) {
        // Cache results for future requests (fire-and-forget)
        cachePlaces(places).catch((err) =>
          console.warn("[PlaceDiscovery] Background cache write failed:", err)
        );

        return {
          ...state,
          discoveredPlaces: places,
        };
      }
    } catch (error) {
      console.warn("[PlaceDiscovery] Google Places API failed, falling back to Overpass:", error);
      state.warnings.push("Google Places API unavailable, using fallback data source.");
    }

    // ── Step 3: Fallback to Overpass API ─────────────────────────
    try {
      console.log(`[PlaceDiscovery] Falling back to Overpass API for ${destination}...`);
      places = await PlaceDiscoveryService.discoverViaOverpass(destination);
      console.log(`[PlaceDiscovery] Overpass returned ${places.length} results`);

      if (places.length > 0) {
        // Cache Overpass results too
        cachePlaces(places).catch((err) =>
          console.warn("[PlaceDiscovery] Background cache write failed:", err)
        );
      }
    } catch (error) {
      console.error("[PlaceDiscovery] Overpass API also failed:", error);
      state.warnings.push("Failed to fetch live place data from all sources.");
    }

    return {
      ...state,
      discoveredPlaces: places,
    };
  }

  /**
   * Original Overpass-based discovery, kept as a fallback.
   * Uses Nominatim for geocoding + Overpass for POI data.
   */
  private static async discoverViaOverpass(destination: string): Promise<Place[]> {
    const places: Place[] = [];

    // 1. Get destination bounding box via Nominatim
    const nomRes = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(destination)}&limit=1`,
      { headers: { "User-Agent": "AITripPlanner/1.0" } }
    );
    const nomData = await nomRes.json();

    if (!nomData || nomData.length === 0) {
      throw new Error("Destination not found via geocoding.");
    }

    const bbox = nomData[0].boundingbox; // [southLat, northLat, westLon, eastLon]
    const s = bbox[0];
    const n = bbox[1];
    const w = bbox[2];
    const e = bbox[3];

    // 2. Fetch POIs via Overpass API
    const query = `
      [out:json][timeout:25];
      (
        node["tourism"~"museum|attraction|viewpoint"](${s},${w},${n},${e});
        node["amenity"~"restaurant|cafe"](${s},${w},${n},${e});
        node["historic"~"monument|ruins"](${s},${w},${n},${e});
      );
      out body 50;
    `;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const overpassRes = await fetch("https://overpass-api.de/api/interpreter", {
      method: "POST",
      body: query,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (overpassRes.ok) {
      const opData = await overpassRes.json();
      const elements = opData.elements || [];

      for (const el of elements) {
        if (el.tags && el.tags.name) {
          let cat = "sightseeing";
          if (el.tags.amenity === "restaurant" || el.tags.amenity === "cafe") cat = "food";
          if (el.tags.tourism === "hotel") cat = "hotel";

          places.push({
            id: `op-${el.id}`,
            name: el.tags.name,
            destination: destination,
            category: cat,
            description: el.tags.description || el.tags.wikipedia || "Local place of interest",
            lat: el.lat,
            lng: el.lon,
            address: `${el.tags["addr:street"] || ""} ${el.tags["addr:city"] || ""}`.trim(),
            openingHours: el.tags.opening_hours
              ? { hours: el.tags.opening_hours }
              : undefined,
            estimatedCost: cat === "food" ? 1500 : 500, // Overpass has no price data
            source: "OpenStreetMap",
          });
        }
      }
    }

    return places;
  }
}
