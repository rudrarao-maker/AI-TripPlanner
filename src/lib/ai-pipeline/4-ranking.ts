import { PipelineState, Place } from "./types";

const INTEREST_CATEGORY_MAP: Record<string, string[]> = {
  "art & culture": ["culture", "history", "sightseeing"],
  "adventure": ["nature", "entertainment", "sightseeing"],
  "food": ["food"],
  "history": ["history", "culture", "sightseeing"],
  "nature": ["nature", "sightseeing"],
  "nightlife": ["entertainment", "food"],
  "shopping": ["shopping"],
  "relaxation": ["nature", "hotel", "spiritual"],
  "spiritual": ["spiritual", "history"],
  "sports": ["entertainment"],
  "photography": ["nature", "sightseeing", "history", "culture"],
  "architecture": ["culture", "history", "sightseeing"],
};

export class ActivityRankingService {
  static rank(state: PipelineState): PipelineState {
    const { discoveredPlaces, preferences } = state;
    const { travelers, interests = [], budgetTier, userProfileWeights = {} } = preferences;

    // Normalize user interests for matching
    const normalizedInterests = interests.map(i => i.toLowerCase());

    const ranked = discoveredPlaces.map((place) => {
      let score = 50; // base score

      // 1. Rating Boost (up to +25)
      if (place.rating) {
        // A 4.5 rating gives +22.5
        score += place.rating * 5; 
      }

      // 2. Interest Matching Boost (up to +30)
      let interestMatched = false;
      for (const interest of normalizedInterests) {
        const mappedCategories = INTEREST_CATEGORY_MAP[interest] || [];
        if (mappedCategories.includes(place.category) || 
            place.name.toLowerCase().includes(interest) ||
            place.description?.toLowerCase().includes(interest)) {
          score += 15;
          interestMatched = true;
        }
      }
      // Small penalty if user specified interests but this place matches none
      if (normalizedInterests.length > 0 && !interestMatched && place.category !== "food") {
        score -= 10;
      }

      // 3. Budget Alignment Boost
      const costPP = (place.estimatedCost || 0) / travelers;
      if (budgetTier === "cheap") {
        if (costPP === 0) score += 15;
        else if (costPP < 1000) score += 10;
        else if (costPP > 3000) score -= 15; // Penalty for expensive items on cheap tier
      } else if (budgetTier === "luxury") {
        if (costPP > 2000) score += 15; // Assume higher cost = more premium experience
        if (place.rating && place.rating >= 4.5) score += 10; // Luxury demands high ratings
      } else if (budgetTier === "moderate") {
        if (costPP >= 500 && costPP <= 2500) score += 10;
      }

      // 4. User Profile Learned Weights (Long-term learning)
      if (place.category && userProfileWeights[place.category]) {
        score += userProfileWeights[place.category] * 5; // amplify slightly so learned preferences matter
      }

      // 5. Data Completeness Boost (favors places with rich data for the UI/LLM)
      if (place.imageUrl) score += 5;
      if (place.openingHours) score += 5;
      
      // 6. Category balancing heuristics
      // Ensure we don't bury food if they didn't explicitly ask for it
      if (place.category === "food" && place.rating && place.rating >= 4.0) {
        score += 10;
      }

      return {
        ...place,
        score,
      };
    });

    // Sort by score descending
    ranked.sort((a, b) => b.score - a.score);

    // Optional: Log top 3 for debugging
    // console.log(`Top ranked for ${preferences.destination}:`, ranked.slice(0, 3).map(p => `${p.name} (${p.score})`));

    return {
      ...state,
      rankedPlaces: ranked,
    };
  }
}
