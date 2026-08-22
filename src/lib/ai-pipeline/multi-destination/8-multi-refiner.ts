import { MultiDestPipelineState, MultiDestItinerarySchema } from "../types";

export class MultiRefiner {
  static async refine(state: MultiDestPipelineState): Promise<MultiDestPipelineState> {
    if (!state.multiDestItinerary) return state;

    try {
      const parsed = MultiDestItinerarySchema.parse(state.multiDestItinerary);
      return {
        ...state,
        multiDestItinerary: parsed,
      };
    } catch (error) {
      console.error("MultiRefiner validation error:", error);
      state.warnings.push(
        "Final multi-destination validation had issues. Returning unrefined version."
      );
      return state;
    }
  }
}
