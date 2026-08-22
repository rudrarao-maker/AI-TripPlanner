import { PipelineState, FinalItinerary, ActivitySchema } from "./types";
import { z } from "zod";

type Activity = z.infer<typeof ActivitySchema>;

export class BudgetPlanner {
  static plan(state: PipelineState): PipelineState {
    if (!state.optimizedItinerary) return state;

    let itinerary = JSON.parse(JSON.stringify(state.optimizedItinerary)) as FinalItinerary;
    const { budget } = state.preferences;

    let { total, totalAcc, totalTrans, totalFood, totalAct, totalMisc } = this.calculateTotals(itinerary);

    // Iterative refinement loop: if over budget, try to swap expensive activities
    const maxIterations = 3;
    let iterations = 0;
    let substitutions = 0;

    while (total > budget && iterations < maxIterations) {
      // Find all swappable activities (ignore hotels/transport as they are structural)
      const swappableActivities: { dayIdx: number, actIdx: number, act: Activity }[] = [];
      
      itinerary.days.forEach((day, dayIdx) => {
        day.activities.forEach((act, actIdx) => {
          if (act.category !== "hotel" && act.category !== "transport" && act.estimatedCost > 0) {
            swappableActivities.push({ dayIdx, actIdx, act });
          }
        });
      });

      if (swappableActivities.length === 0) break; // Nothing to swap

      // Sort by most expensive first
      swappableActivities.sort((a, b) => b.act.estimatedCost - a.act.estimatedCost);
      const targetToSwap = swappableActivities[0];

      // Get current itinerary place IDs to avoid duplicates
      const currentPlaceIds = new Set<string>();
      itinerary.days.forEach(d => d.activities.forEach(a => currentPlaceIds.add(a.placeId || a.title)));

      // Find a cheaper alternative from ranked places
      const alternative = state.rankedPlaces.find(p => 
        !currentPlaceIds.has(p.id) && 
        (p.estimatedCost || 0) < targetToSwap.act.estimatedCost &&
        (p.category === targetToSwap.act.category || p.category === "sightseeing" || p.category === "nature")
      );

      if (alternative) {
        // Perform the swap
        const newAct: Activity = {
          title: alternative.name,
          placeId: alternative.id,
          category: alternative.category,
          startTime: targetToSwap.act.startTime,
          endTime: targetToSwap.act.endTime,
          durationMinutes: targetToSwap.act.durationMinutes,
          description: alternative.description || `Visit ${alternative.name}`,
          estimatedCost: alternative.estimatedCost || 0,
          travelTimeMinutes: targetToSwap.act.travelTimeMinutes,
          transportation: targetToSwap.act.transportation,
          priority: "recommended",
          bookingRequired: false,
        };

        itinerary.days[targetToSwap.dayIdx].activities[targetToSwap.actIdx] = newAct;
        substitutions++;
        
        // Recalculate
        const newTotals = this.calculateTotals(itinerary);
        total = newTotals.total;
        totalAcc = newTotals.totalAcc;
        totalTrans = newTotals.totalTrans;
        totalFood = newTotals.totalFood;
        totalAct = newTotals.totalAct;
        totalMisc = newTotals.totalMisc;
      } else {
        // No cheaper alternative found, break out
        break;
      }

      iterations++;
    }

    if (total > budget) {
      state.warnings.push(`Budget Exceeded! Estimated: ₹${total}, Budget: ₹${budget}. Swapped ${substitutions} items but couldn't lower it further.`);
    } else if (substitutions > 0) {
      state.warnings.push(`Auto-adjusted budget: swapped ${substitutions} expensive activities for cheaper highly-ranked alternatives to stay under ₹${budget}.`);
    }

    itinerary.tripSummary.estimatedTotal = total;

    return {
      ...state,
      finalItinerary: itinerary,
      budgetSummary: {
        accommodation: totalAcc,
        transportation: totalTrans,
        food: totalFood,
        activities: totalAct,
        miscellaneous: totalMisc,
        total,
      }
    };
  }

  private static calculateTotals(itinerary: FinalItinerary) {
    let totalAcc = 0;
    let totalTrans = 0;
    let totalFood = 0;
    let totalAct = 0;

    itinerary.days.forEach(day => {
      let dailyCost = 0;
      day.activities.forEach(act => {
        const cost = act.estimatedCost || 0;
        dailyCost += cost;

        if (act.category === "hotel") totalAcc += cost;
        else if (act.category === "transport") totalTrans += cost;
        else if (act.category === "food") totalFood += cost;
        else totalAct += cost;
      });
      day.estimatedDailyCost = dailyCost;
    });

    const totalMisc = Math.round((totalAcc + totalTrans + totalFood + totalAct) * 0.1);
    const total = totalAcc + totalTrans + totalFood + totalAct + totalMisc;

    return { total, totalAcc, totalTrans, totalFood, totalAct, totalMisc };
  }
}
