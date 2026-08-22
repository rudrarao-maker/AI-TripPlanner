import { PipelineState, FinalItinerary } from "./types";
import { optimizeRouteWithGoogle, LocationActivity } from "../routeOptimizer";

export class ScheduleOptimizer {
  static async optimize(state: PipelineState): Promise<PipelineState> {
    if (!state.itineraryDraft) return state;

    const draft = state.itineraryDraft as FinalItinerary;
    let conflicts = 0;
    let routeImprovements = 0;

    const transportPref = state.preferences.transportPreference || "DRIVE";

    for (const day of draft.days) {
      if (day.activities.length <= 1) continue;

      // Extract activities as LocationActivity objects to pass to our optimizer.
      // We need real lat/lng. The LLM might not have returned them directly,
      // but we can look them up from our rankedPlaces if they have placeIds,
      // or we just rely on the LLM generating them if we asked it to (it doesn't currently).
      
      // Let's map them to our known places to get coordinates.
      const activitiesWithCoords = day.activities.map(act => {
        const knownPlace = state.rankedPlaces.find(p => p.id === act.placeId || p.name === act.title);
        return {
          ...act,
          id: act.placeId || act.title,
          name: act.title,
          lat: knownPlace?.lat || 0,
          lng: knownPlace?.lng || 0,
          originalAct: act,
        };
      });

      // Only optimize routing if we actually have coordinates for most places
      const validCoords = activitiesWithCoords.filter(a => a.lat !== 0 && a.lng !== 0);
      
      if (validCoords.length > 1 && validCoords.length === day.activities.length) {
        // We have coordinates for all items today! Let's geographically sort them.
        try {
          const { optimized, travelTimes, travelModes } = await optimizeRouteWithGoogle(
            activitiesWithCoords, 
            transportPref
          );
          
          routeImprovements++;
          
          // Re-assign sorted order and update travel times
          day.activities = optimized.map((opt, idx) => {
            const act = opt.originalAct;
            act.travelTimeMinutes = travelTimes[idx];
            act.transportation = travelModes[idx];
            return act;
          });

        } catch (e) {
          console.warn(`Failed to geographic route day ${day.dayNumber}:`, e);
        }
      }

      // Now fix schedule overlaps (sequencing time)
      // Implement pacing logic based on user preference
      let paceBufferMs = 15 * 60000; // default balanced
      if (state.preferences.pace?.toLowerCase() === "fast") paceBufferMs = 5 * 60000;
      if (state.preferences.pace?.toLowerCase() === "relaxed") paceBufferMs = 30 * 60000;

      let currentStartMs = new Date(`1970/01/01 09:00:00`).getTime(); // Start day at 9 AM
      if (day.activities.length > 0 && day.activities[0].startTime) {
        const parsed = new Date(`1970/01/01 ${day.activities[0].startTime}`).getTime();
        if (!isNaN(parsed)) currentStartMs = Math.max(parsed, new Date(`1970/01/01 07:00:00`).getTime());
      }
      
      let hadLunch = false;
      let hadDinner = false;
      
      const newActivities = [];

      for (let i = 0; i < day.activities.length; i++) {
        let act = day.activities[i];
        const knownPlace = state.rankedPlaces.find(p => p.id === act.placeId || p.name === act.title);
        
        // --- Meal Time Enforcements ---
        const currentHour = new Date(currentStartMs).getHours();
        
        // Lunch block check (12 PM - 2 PM)
        if (currentHour >= 12 && currentHour < 15 && !hadLunch && !act.category?.toLowerCase().includes("dining")) {
           // Inject lunch block before this activity
           newActivities.push({
             title: "Lunch Break",
             location: "Local area",
             description: "Time allotted for lunch.",
             category: "dining",
             startTime: new Date(currentStartMs).toTimeString().substring(0, 5),
             endTime: new Date(currentStartMs + 60 * 60000).toTimeString().substring(0, 5),
             durationMinutes: 60,
             estimatedCost: 15,
             travelTimeMinutes: 10,
             transportation: "WALK"
           });
           currentStartMs += (60 * 60000) + paceBufferMs;
           hadLunch = true;
        } else if (act.category?.toLowerCase().includes("dining") && currentHour >= 11 && currentHour <= 15) {
           hadLunch = true;
        }

        // Dinner block check (7 PM - 9 PM)
        if (currentHour >= 19 && !hadDinner && !act.category?.toLowerCase().includes("dining")) {
           newActivities.push({
             title: "Dinner Break",
             location: "Local area",
             description: "Time allotted for dinner.",
             category: "dining",
             startTime: new Date(currentStartMs).toTimeString().substring(0, 5),
             endTime: new Date(currentStartMs + 90 * 60000).toTimeString().substring(0, 5),
             durationMinutes: 90,
             estimatedCost: 30,
             travelTimeMinutes: 15,
             transportation: "WALK"
           });
           currentStartMs += (90 * 60000) + paceBufferMs;
           hadDinner = true;
        } else if (act.category?.toLowerCase().includes("dining") && currentHour >= 18) {
           hadDinner = true;
        }

        // --- Opening Hours Validation ---
        // Simplified check: if it's closed, maybe skip or push to next day. 
        // For now, if knownPlace has openingHours, we can check it. (Assuming a generic 9-5 if not found but we don't strict enforce generic)
        if (knownPlace && knownPlace.openingHours) {
           // We would parse openingHours for the specific day of week, but for this constraint we'll log it
           // state.warnings.push(`Checked opening hours for ${act.title}`);
        }
        
        // Ensure start time is formatted correctly
        const startDate = new Date(currentStartMs);
        act.startTime = startDate.toTimeString().substring(0, 5);
        
        // Calculate end time
        const endMs = currentStartMs + (act.durationMinutes * 60000);
        const endDate = new Date(endMs);
        act.endTime = endDate.toTimeString().substring(0, 5);
        
        // Prep next activity's start time by adding travel time + buffer
        const travelMs = (act.travelTimeMinutes || 15) * 60000;
        currentStartMs = endMs + travelMs + paceBufferMs;
        
        newActivities.push(act);
      }
      
      day.activities = newActivities as any;
    }

    if (routeImprovements > 0) {
      state.warnings.push(`Geographically optimized routes for ${routeImprovements} days.`);
    }

    return {
      ...state,
      optimizedItinerary: draft,
    };
  }
}
