import { PipelineState, FinalItinerarySchema, FinalItinerary } from "./types";

export class ItineraryRefiner {
  static async refine(state: PipelineState): Promise<PipelineState> {
    if (!state.finalItinerary) return state;

    try {
      // Validate the final itinerary against the Zod schema one last time
      // to ensure the optimizer or budget planner didn't break the structure.
      const parsed = FinalItinerarySchema.parse(state.finalItinerary);
      
      return {
        ...state,
        finalItinerary: parsed,
      };
    } catch (error) {
      console.error("ItineraryRefiner validation error:", error);
      state.warnings.push("Final validation failed. Trying to return the unrefined version.");
      return state;
    }
  }
}
