// src/lib/routeOptimizer.ts

export interface LocationActivity {
  id: string;
  name: string;
  lat: number;
  lng: number;
  [key: string]: any;
}

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

/**
 * Optimizes the route of activities using the Nearest Neighbor heuristic.
 * Starts with the first activity in the array (e.g., a hotel) and finds the closest next stop.
 */
export function optimizeRoute<T extends LocationActivity>(activities: T[]): {
  optimized: T[];
  travelTimes: number[]; // Time in minutes to the next activity
} {
  if (!activities || activities.length <= 1) {
    return { optimized: activities, travelTimes: [0] };
  }

  const unvisited = [...activities];
  // Start at the first item
  const optimized: T[] = [unvisited.shift() as T];
  const travelTimes: number[] = [];
  
  // Average city driving speed: 30 km/h -> 0.5 km/min
  const AVG_SPEED_KM_PER_MIN = 0.5;

  while (unvisited.length > 0) {
    const current = optimized[optimized.length - 1];
    
    let nearestIndex = 0;
    let shortestDistance = Infinity;

    // Find nearest neighbor
    for (let i = 0; i < unvisited.length; i++) {
      const candidate = unvisited[i];
      const dist = getDistance(current.lat, current.lng, candidate.lat, candidate.lng);
      
      if (dist < shortestDistance) {
        shortestDistance = dist;
        nearestIndex = i;
      }
    }

    // Record travel time (distance / speed) + 5 mins buffer for traffic/parking
    const timeInMins = Math.max(5, Math.round(shortestDistance / AVG_SPEED_KM_PER_MIN) + 5);
    travelTimes.push(timeInMins);

    // Move nearest to optimized
    const nextStop = unvisited.splice(nearestIndex, 1)[0];
    optimized.push(nextStop);
  }

  // The last location doesn't have a "next" stop travel time
  travelTimes.push(0);

  return { optimized, travelTimes };
}
