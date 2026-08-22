import { MultiDestPipelineState, DestinationBudgetSchema } from "../types";
import { z } from "zod";

export class MultiBudgetPlanner {
  static plan(state: MultiDestPipelineState): MultiDestPipelineState {
    if (!state.multiDestItinerary) return state;

    const itinerary = state.multiDestItinerary;
    const { travelers, budget } = state.preferences;

    const perDestination: Record<string, z.infer<typeof DestinationBudgetSchema>> = {};
    let grandTotal = 0;

    for (const dest of itinerary.destinations) {
      const destBudget = dest.destinationBudget;
      perDestination[dest.name] = destBudget;
      grandTotal += destBudget.total;
    }

    // Add inter-transport costs
    const interTransport = state.transfers.reduce(
      (sum, t) => sum + (t.estimatedCost || 0), 0
    );
    grandTotal += interTransport;
    itinerary.interTransportBudget = interTransport;

    // Update trip summary
    itinerary.tripSummary.estimatedTotal = grandTotal;
    itinerary.tripSummary.perPerson = Math.round(grandTotal / travelers);
    itinerary.tripSummary.perDay = Math.round(
      grandTotal / itinerary.tripSummary.totalDays
    );

    // Budget warnings
    if (grandTotal > budget) {
      const overage = grandTotal - budget;
      state.warnings.push(
        `Budget exceeded by ${overage} ${state.preferences.currency}. ` +
        `Estimated: ${grandTotal}, Budget: ${budget}. Consider reducing activities or choosing cheaper options.`
      );
    }

    return {
      ...state,
      multiDestItinerary: itinerary,
      budgetSummary: {
        perDestination,
        interTransport,
        total: grandTotal,
        perPerson: Math.round(grandTotal / travelers),
        perDay: Math.round(grandTotal / itinerary.tripSummary.totalDays),
      },
    };
  }
}
