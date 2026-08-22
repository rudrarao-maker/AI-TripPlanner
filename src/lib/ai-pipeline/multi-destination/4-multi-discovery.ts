import { MultiDestPipelineState, Place } from "../types";
import { PlaceDiscoveryService } from "../3-place-discovery";

export class MultiDiscovery {
  /**
   * Runs place discovery for each destination in parallel.
   * Reuses the existing single-destination PlaceDiscoveryService.
   */
  static async discover(state: MultiDestPipelineState): Promise<MultiDestPipelineState> {
    const { destinationEntries, preferences } = state;
    const perDestinationPlaces: Record<string, Place[]> = {};

    // Run discoveries in parallel for speed
    const results = await Promise.all(
      destinationEntries.map(async (dest) => {
        try {
          const singleState = {
            preferences: { ...preferences, destination: dest.name },
            context: {},
            discoveredPlaces: [] as Place[],
            rankedPlaces: [],
            warnings: [],
          };

          const result = await PlaceDiscoveryService.discover(singleState);
          return { name: dest.name, places: result.discoveredPlaces };
        } catch (error) {
          console.error(`Discovery failed for ${dest.name}:`, error);
          return { name: dest.name, places: [] };
        }
      })
    );

    for (const r of results) {
      perDestinationPlaces[r.name] = r.places;
    }

    return {
      ...state,
      perDestinationPlaces,
    };
  }
}
