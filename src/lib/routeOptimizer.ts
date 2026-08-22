// src/lib/routeOptimizer.ts

export interface LocationActivity {
  id: string;
  name: string;
  lat: number;
  lng: number;
  [key: string]: any;
}

// ─── Naive Sync Optimizer (Used by Client UI for instant drag-and-drop) ───

// Haversine formula to calculate distance between two coordinates in kilometers
function getDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Radius of the earth in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c; // Distance in km
  return d;
}

export function optimizeRoute<T extends LocationActivity>(activities: T[]): {
  optimized: T[];
  travelTimes: number[]; // Time in minutes to the next activity
} {
  if (!activities || activities.length <= 1) {
    return { optimized: activities, travelTimes: [0] };
  }

  const unvisited = [...activities];
  const optimized: T[] = [unvisited.shift() as T];
  const travelTimes: number[] = [];
  
  // Average city driving speed: 30 km/h -> 0.5 km/min
  const AVG_SPEED_KM_PER_MIN = 0.5;

  while (unvisited.length > 0) {
    const current = optimized[optimized.length - 1];
    
    let nearestIndex = 0;
    let shortestDistance = Infinity;

    for (let i = 0; i < unvisited.length; i++) {
      const candidate = unvisited[i];
      const dist = getDistance(current.lat, current.lng, candidate.lat, candidate.lng);
      
      if (dist < shortestDistance) {
        shortestDistance = dist;
        nearestIndex = i;
      }
    }

    const timeInMins = Math.max(5, Math.round(shortestDistance / AVG_SPEED_KM_PER_MIN) + 5);
    travelTimes.push(timeInMins);

    const nextStop = unvisited.splice(nearestIndex, 1)[0];
    optimized.push(nextStop);
  }

  travelTimes.push(0);

  return { optimized, travelTimes };
}

// ─── Real Async Optimizer (Used by Backend AI Pipeline) ───

/**
 * Optimizes the route using Google Maps Routes API (Distance Matrix).
 * Uses real driving/walking/transit times and accounts for time of day.
 */
export async function optimizeRouteWithGoogle<T extends LocationActivity>(
  activities: T[],
  transportPreference: string = "DRIVE"
): Promise<{
  optimized: T[];
  travelTimes: number[];
  travelModes: string[];
}> {
  if (!activities || activities.length <= 1) {
    return { optimized: activities, travelTimes: [0], travelModes: ["walk"] };
  }

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  if (!apiKey) {
    console.warn("No Maps API key, falling back to naive route optimization");
    const fallback = optimizeRoute(activities);
    return { ...fallback, travelModes: Array(fallback.travelTimes.length).fill("DRIVE") };
  }

  // To do a true TSP (Traveling Salesperson) with a distance matrix, we need all N*N pairs.
  // For standard daily itineraries (e.g. 4-6 places), N is small enough.
  
  const origins = activities.map(a => ({
    waypoint: { location: { latLng: { latitude: a.lat, longitude: a.lng } } }
  }));
  
  const destinations = [...origins];

  // Map user transport preference to Google Routing API travel mode
  let travelMode = "DRIVE";
  const pref = transportPreference.toLowerCase();
  if (pref.includes("walk")) travelMode = "WALK";
  if (pref.includes("bike")) travelMode = "BICYCLE";
  if (pref.includes("transit") || pref.includes("public")) travelMode = "TRANSIT";

  try {
    const res = await fetch("https://routes.googleapis.com/distanceMatrix/v2:computeRouteMatrix", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": apiKey,
        "X-Goog-FieldMask": "originIndex,destinationIndex,duration,distanceMeters,condition",
      },
      body: JSON.stringify({
        origins,
        destinations,
        travelMode,
        routingPreference: travelMode === "DRIVE" ? "TRAFFIC_AWARE" : undefined,
      })
    });

    if (!res.ok) {
      throw new Error(`Google Distance Matrix API error: ${res.status}`);
    }

    const data: any[] = await res.json();
    
    // Build N x N distance matrix (time in seconds)
    const n = activities.length;
    const timeMatrix = Array(n).fill(0).map(() => Array(n).fill(Infinity));
    
    for (const edge of data) {
      if (edge.condition !== "ROUTE_EXISTS") continue;
      const i = edge.originIndex;
      const j = edge.destinationIndex;
      // parse "123s" into 123
      const durationSecs = edge.duration ? parseInt(edge.duration.replace("s", "")) : 0;
      timeMatrix[i][j] = durationSecs;
    }

    // Nearest neighbor algorithm using the real time matrix
    const unvisitedIndices = new Set(Array.from({length: n}, (_, i) => i));
    
    // Start at index 0 (assuming first activity is the hotel/start point)
    let currentIdx = 0;
    unvisitedIndices.delete(0);
    
    const optimized: T[] = [activities[0]];
    const travelTimes: number[] = [];
    const travelModes: string[] = [];

    while (unvisitedIndices.size > 0) {
      let nearestIdx = -1;
      let shortestTime = Infinity;

      for (const candidateIdx of unvisitedIndices) {
        const time = timeMatrix[currentIdx][candidateIdx];
        if (time < shortestTime) {
          shortestTime = time;
          nearestIdx = candidateIdx;
        }
      }

      // If no route exists to any remaining node, just pick the first unvisited and guess time
      if (nearestIdx === -1) {
        nearestIdx = Array.from(unvisitedIndices)[0];
        shortestTime = 15 * 60; // 15 mins fallback
      }

      // Convert seconds to minutes, add 5 mins buffer for parking/walking
      const timeInMins = Math.max(5, Math.ceil(shortestTime / 60) + (travelMode === "DRIVE" ? 5 : 0));
      travelTimes.push(timeInMins);
      
      // Smart mode selection: if it's < 10 mins walk, just walk instead of driving
      if (travelMode === "DRIVE" && timeMatrix[currentIdx][nearestIdx] < 600) {
         travelModes.push("walk");
      } else {
         travelModes.push(travelMode.toLowerCase());
      }

      optimized.push(activities[nearestIdx]);
      unvisitedIndices.delete(nearestIdx);
      currentIdx = nearestIdx;
    }

    travelTimes.push(0);
    travelModes.push(travelMode.toLowerCase());

    return { optimized, travelTimes, travelModes };

  } catch (error) {
    console.error("Failed to optimize with Google Routes API:", error);
    const fallback = optimizeRoute(activities);
    return { ...fallback, travelModes: Array(fallback.travelTimes.length).fill("DRIVE") };
  }
}
