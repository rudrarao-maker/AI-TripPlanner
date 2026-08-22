import { MultiDestPipelineState, DestinationEntry } from "../types";

// Haversine formula
function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * (Math.PI / 180)) *
    Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function totalRouteDistance(dests: DestinationEntry[]): number {
  let total = 0;
  for (let i = 0; i < dests.length - 1; i++) {
    const a = dests[i];
    const b = dests[i + 1];
    if (a.lat && a.lng && b.lat && b.lng) {
      total += haversineKm(a.lat, a.lng, b.lat, b.lng);
    }
  }
  return total;
}

/**
 * Nearest-neighbor route optimizer for destinations.
 * Tries to minimize total inter-destination travel distance.
 * Keeps the first destination fixed (arrival city) and optimizes the rest.
 */
function optimizeOrder(dests: DestinationEntry[]): DestinationEntry[] {
  if (dests.length <= 2) return dests;

  // Keep first destination fixed
  const fixed = dests[0];
  const remaining = [...dests.slice(1)];
  const result: DestinationEntry[] = [fixed];

  let current = fixed;
  while (remaining.length > 0) {
    let bestIdx = 0;
    let bestDist = Infinity;

    for (let i = 0; i < remaining.length; i++) {
      const candidate = remaining[i];
      if (current.lat && current.lng && candidate.lat && candidate.lng) {
        const dist = haversineKm(current.lat, current.lng, candidate.lat, candidate.lng);
        if (dist < bestDist) {
          bestDist = dist;
          bestIdx = i;
        }
      }
    }

    const next = remaining.splice(bestIdx, 1)[0];
    result.push(next);
    current = next;
  }

  // Re-assign order
  return result.map((d, i) => ({ ...d, order: i + 1 }));
}

export class RouteOptimizer {
  static optimize(state: MultiDestPipelineState): MultiDestPipelineState {
    const { destinationEntries } = state;

    // Only optimize if we have geocoded coordinates
    const hasCoords = destinationEntries.every(d => d.lat != null && d.lng != null);

    if (!hasCoords || destinationEntries.length <= 2) {
      return {
        ...state,
        optimizedOrder: destinationEntries,
        routeOptimizationSuggested: false,
      };
    }

    const originalDistance = totalRouteDistance(destinationEntries);
    const optimized = optimizeOrder(destinationEntries);
    const optimizedDistance = totalRouteDistance(optimized);

    // Only suggest if savings > 10%
    const savings = originalDistance - optimizedDistance;
    const savingsPercent = (savings / originalDistance) * 100;

    if (savingsPercent > 10) {
      state.warnings.push(
        `AI suggests reordering destinations to save ~${Math.round(savings)} km (${Math.round(savingsPercent)}% less travel). ` +
        `Suggested: ${optimized.map(d => d.name).join(" → ")}`
      );
      return {
        ...state,
        optimizedOrder: optimized,
        routeOptimizationSuggested: true,
        // Keep original order unless user accepts
        destinationEntries: destinationEntries,
      };
    }

    return {
      ...state,
      optimizedOrder: destinationEntries,
      routeOptimizationSuggested: false,
    };
  }
}
