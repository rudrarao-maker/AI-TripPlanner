/**
 * Google Places API (New) client for the AI Trip Planner.
 *
 * Uses the Places API (New) REST endpoints:
 * - Text Search: POST https://places.googleapis.com/v1/places:searchText
 *
 * Maps Google's priceLevel to realistic cost estimates calibrated
 * by destination cost-of-living so "MODERATE" means ₹800 in Bali
 * but ₹3000 in Tokyo.
 */

import { Place } from "./ai-pipeline/types";

// ─── Types ───────────────────────────────────────────────────────

interface GooglePlaceResult {
  id: string;
  displayName?: { text: string; languageCode?: string };
  formattedAddress?: string;
  location?: { latitude: number; longitude: number };
  rating?: number;
  priceLevel?: string;
  primaryType?: string;
  editorialSummary?: { text: string };
  regularOpeningHours?: {
    weekdayDescriptions?: string[];
    openNow?: boolean;
  };
  photos?: Array<{
    name: string;
    widthPx: number;
    heightPx: number;
  }>;
  types?: string[];
}

interface TextSearchResponse {
  places?: GooglePlaceResult[];
}

// ─── Cost-of-Living Multipliers ──────────────────────────────────
// Base costs are in INR. Multiplier adjusts for destination region.
// 1.0 = India baseline.

const COST_MULTIPLIERS: Record<string, number> = {
  // South Asia
  india: 1.0,
  nepal: 0.8,
  "sri lanka": 0.9,
  bangladesh: 0.7,
  // Southeast Asia
  thailand: 1.2,
  vietnam: 0.9,
  indonesia: 1.0,
  bali: 1.1,
  malaysia: 1.3,
  philippines: 1.0,
  cambodia: 0.8,
  // East Asia
  japan: 3.5,
  "south korea": 2.8,
  china: 2.0,
  taiwan: 2.2,
  "hong kong": 3.8,
  singapore: 3.5,
  // Europe
  france: 3.2,
  italy: 2.8,
  spain: 2.5,
  germany: 3.0,
  uk: 3.5,
  "united kingdom": 3.5,
  switzerland: 4.5,
  netherlands: 3.2,
  portugal: 2.3,
  greece: 2.2,
  turkey: 1.5,
  // Americas
  usa: 3.8,
  "united states": 3.8,
  canada: 3.2,
  mexico: 1.5,
  brazil: 1.8,
  argentina: 1.3,
  colombia: 1.2,
  // Middle East
  uae: 3.5,
  dubai: 3.8,
  qatar: 3.5,
  // Africa
  egypt: 1.0,
  morocco: 1.2,
  "south africa": 1.5,
  kenya: 1.2,
  // Oceania
  australia: 3.5,
  "new zealand": 3.2,
};

/** Base costs per price level in INR (for India baseline) */
const BASE_COSTS: Record<string, { food: number; activity: number }> = {
  PRICE_LEVEL_FREE: { food: 0, activity: 0 },
  PRICE_LEVEL_INEXPENSIVE: { food: 300, activity: 200 },
  PRICE_LEVEL_MODERATE: { food: 800, activity: 500 },
  PRICE_LEVEL_EXPENSIVE: { food: 1500, activity: 1200 },
  PRICE_LEVEL_VERY_EXPENSIVE: { food: 3000, activity: 2500 },
};

// ─── Interest → Search Query Mapping ─────────────────────────────

const INTEREST_QUERIES: Record<string, string[]> = {
  "art & culture": ["art museums in {dest}", "cultural centers in {dest}", "galleries in {dest}"],
  "adventure": ["adventure activities in {dest}", "outdoor activities in {dest}", "hiking trails near {dest}"],
  "food": ["best restaurants in {dest}", "local street food in {dest}", "food tours in {dest}"],
  "history": ["historical landmarks in {dest}", "heritage sites in {dest}", "ancient monuments in {dest}"],
  "nature": ["nature parks in {dest}", "gardens in {dest}", "scenic viewpoints in {dest}"],
  "nightlife": ["nightlife in {dest}", "bars and clubs in {dest}", "live music venues in {dest}"],
  "shopping": ["shopping markets in {dest}", "local boutiques in {dest}", "shopping malls in {dest}"],
  "relaxation": ["spas in {dest}", "wellness retreats in {dest}", "peaceful spots in {dest}"],
  "photography": ["photo spots in {dest}", "scenic views in {dest}", "instagram spots in {dest}"],
  "architecture": ["architectural landmarks in {dest}", "famous buildings in {dest}"],
  "spiritual": ["temples in {dest}", "religious sites in {dest}", "pilgrimage sites in {dest}"],
  "sports": ["sports activities in {dest}", "stadiums in {dest}", "water sports in {dest}"],
};

/** Queries that are always included regardless of interests */
const DEFAULT_QUERIES = [
  "top things to do in {dest}",
  "popular tourist attractions in {dest}",
  "best restaurants in {dest}",
  "cafes in {dest}",
];

// ─── Public API ──────────────────────────────────────────────────

/**
 * Fetches real places from Google Places API (New) for a destination.
 * Returns an array of Place objects compatible with the AI pipeline.
 */
export async function fetchGooglePlaces(
  destination: string,
  interests: string[] = [],
  maxResults = 50
): Promise<Place[]> {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  if (!apiKey) {
    throw new Error("GOOGLE_PLACES_API_KEY not configured");
  }

  // Build search queries from interests
  const queries = buildSearchQueries(destination, interests);

  // Run searches in parallel (limited concurrency to avoid rate limits)
  const allPlaces: Place[] = [];
  const seenNames = new Set<string>();
  const multiplier = getCostMultiplier(destination);

  // Process queries in batches of 3 to stay within rate limits
  for (let i = 0; i < queries.length; i += 3) {
    const batch = queries.slice(i, i + 3);
    const results = await Promise.allSettled(
      batch.map((q) => textSearch(q, apiKey))
    );

    for (const result of results) {
      if (result.status === "fulfilled" && result.value) {
        for (const gPlace of result.value) {
          const name = gPlace.displayName?.text;
          if (!name || seenNames.has(name.toLowerCase())) continue;
          seenNames.add(name.toLowerCase());

          const place = mapToPlace(gPlace, destination, multiplier, apiKey);
          allPlaces.push(place);

          if (allPlaces.length >= maxResults) break;
        }
      }
    }

    if (allPlaces.length >= maxResults) break;
  }

  return allPlaces;
}

// ─── Internal Helpers ────────────────────────────────────────────

function buildSearchQueries(destination: string, interests: string[]): string[] {
  const queries = new Set<string>();

  // Always-include queries
  for (const q of DEFAULT_QUERIES) {
    queries.add(q.replace("{dest}", destination));
  }

  // Interest-based queries
  for (const interest of interests) {
    const key = interest.toLowerCase();
    const templates = INTEREST_QUERIES[key];
    if (templates) {
      for (const t of templates) {
        queries.add(t.replace("{dest}", destination));
      }
    }
  }

  // If no interests, add general sightseeing
  if (interests.length === 0) {
    queries.add(`museums and landmarks in ${destination}`);
    queries.add(`parks and nature in ${destination}`);
  }

  return Array.from(queries);
}

async function textSearch(
  query: string,
  apiKey: string
): Promise<GooglePlaceResult[]> {
  const url = "https://places.googleapis.com/v1/places:searchText";

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": apiKey,
      "X-Goog-FieldMask": [
        "places.id",
        "places.displayName",
        "places.formattedAddress",
        "places.location",
        "places.rating",
        "places.priceLevel",
        "places.primaryType",
        "places.editorialSummary",
        "places.regularOpeningHours",
        "places.photos",
        "places.types",
      ].join(","),
    },
    body: JSON.stringify({
      textQuery: query,
      maxResultCount: 10,
      languageCode: "en",
    }),
  });

  if (!res.ok) {
    console.error(`Google Places API error for "${query}": ${res.status} ${res.statusText}`);
    return [];
  }

  const data: TextSearchResponse = await res.json();
  return data.places || [];
}

function getCostMultiplier(destination: string): number {
  const lower = destination.toLowerCase();

  // Try exact match first
  for (const [key, mult] of Object.entries(COST_MULTIPLIERS)) {
    if (lower.includes(key)) return mult;
  }

  // Default to moderate international cost
  return 2.0;
}

function mapToPlace(
  gPlace: GooglePlaceResult,
  destination: string,
  costMultiplier: number,
  apiKey: string
): Place {
  const name = gPlace.displayName?.text || "Unknown Place";
  const category = mapCategory(gPlace.primaryType, gPlace.types);
  const priceLevel = gPlace.priceLevel || "PRICE_LEVEL_MODERATE";

  // Calculate realistic cost
  const baseCost = category === "food"
    ? (BASE_COSTS[priceLevel]?.food ?? 500)
    : (BASE_COSTS[priceLevel]?.activity ?? 300);
  const estimatedCost = Math.round(baseCost * costMultiplier);

  // Build photo URL (first photo if available)
  let imageUrl: string | undefined;
  if (gPlace.photos && gPlace.photos.length > 0) {
    const photoName = gPlace.photos[0].name;
    imageUrl = `https://places.googleapis.com/v1/${photoName}/media?maxHeightPx=400&maxWidthPx=600&key=${apiKey}`;
  }

  // Parse opening hours into a record
  let openingHours: Record<string, string> | undefined;
  if (gPlace.regularOpeningHours?.weekdayDescriptions) {
    openingHours = {};
    for (const desc of gPlace.regularOpeningHours.weekdayDescriptions) {
      // Format: "Monday: 9:00 AM – 5:00 PM"
      const colonIdx = desc.indexOf(":");
      if (colonIdx > 0) {
        const day = desc.substring(0, colonIdx).trim();
        const hours = desc.substring(colonIdx + 1).trim();
        openingHours[day] = hours;
      }
    }
  }

  // Estimate visit duration based on category
  const estimatedVisitDuration = getEstimatedDuration(category);

  return {
    id: `gp-${gPlace.id}`,
    name,
    destination,
    category,
    description: gPlace.editorialSummary?.text || `${name} — a popular ${category} spot in ${destination}`,
    lat: gPlace.location?.latitude,
    lng: gPlace.location?.longitude,
    address: gPlace.formattedAddress,
    openingHours,
    estimatedVisitDuration,
    estimatedCost,
    rating: gPlace.rating,
    imageUrl,
    source: "GooglePlaces",
  };
}

function mapCategory(
  primaryType: string | undefined,
  types: string[] | undefined
): string {
  const allTypes = [primaryType, ...(types || [])].filter(Boolean) as string[];
  const joined = allTypes.join(" ").toLowerCase();

  if (joined.includes("restaurant") || joined.includes("cafe") || joined.includes("bakery") || joined.includes("food") || joined.includes("bar")) {
    return "food";
  }
  if (joined.includes("hotel") || joined.includes("lodging")) {
    return "hotel";
  }
  if (joined.includes("museum") || joined.includes("art_gallery")) {
    return "culture";
  }
  if (joined.includes("park") || joined.includes("garden") || joined.includes("natural_feature")) {
    return "nature";
  }
  if (joined.includes("temple") || joined.includes("church") || joined.includes("mosque") || joined.includes("place_of_worship")) {
    return "spiritual";
  }
  if (joined.includes("shopping") || joined.includes("store") || joined.includes("market")) {
    return "shopping";
  }
  if (joined.includes("amusement") || joined.includes("stadium") || joined.includes("zoo") || joined.includes("aquarium")) {
    return "entertainment";
  }
  if (joined.includes("monument") || joined.includes("historic") || joined.includes("heritage")) {
    return "history";
  }

  return "sightseeing";
}

function getEstimatedDuration(category: string): number {
  switch (category) {
    case "food": return 60;       // 1 hour for a meal
    case "culture": return 120;   // 2 hours for museums
    case "nature": return 90;     // 1.5 hours for parks
    case "spiritual": return 45;  // 45 min for temples
    case "shopping": return 90;   // 1.5 hours
    case "entertainment": return 150; // 2.5 hours
    case "history": return 90;    // 1.5 hours
    case "hotel": return 30;      // check-in
    default: return 60;           // 1 hour default
  }
}
