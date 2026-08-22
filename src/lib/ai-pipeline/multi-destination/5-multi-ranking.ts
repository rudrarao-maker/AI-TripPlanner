import { MultiDestPipelineState, Place } from "../types";
import { ActivityRankingService } from "../4-ranking";

export class MultiRanking {
  /**
   * Runs ranking for each destination, applying per-destination preference overrides.
   */
  static rank(state: MultiDestPipelineState): MultiDestPipelineState {
    const { destinationEntries, preferences, perDestinationPlaces } = state;
    const perDestinationRanked: Record<string, (Place & { score: number })[]> = {};

    for (const dest of destinationEntries) {
      const places = perDestinationPlaces[dest.name] || [];

      // Build effective preferences merging global + destination overrides
      const effectivePrefs = {
        ...preferences,
        destination: dest.name,
        pace: dest.customPreferences?.pace || preferences.pace,
        interests: dest.customPreferences?.interests || preferences.interests,
        budgetTier: preferences.budgetTier,
      };

      // Use existing ranking logic
      const singleState = {
        preferences: effectivePrefs,
        context: {},
        discoveredPlaces: places,
        rankedPlaces: [],
        warnings: [],
      };

      const ranked = ActivityRankingService.rank(singleState);
      perDestinationRanked[dest.name] = ranked.rankedPlaces;
    }

    return {
      ...state,
      perDestinationRanked,
    };
  }
}
