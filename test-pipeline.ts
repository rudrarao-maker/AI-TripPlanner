import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { TripInputValidator } from './src/lib/ai-pipeline/1-validator';
import { DestinationAnalyzer } from './src/lib/ai-pipeline/2-destination';
import { PlaceDiscoveryService } from './src/lib/ai-pipeline/3-place-discovery';
import { ActivityRankingService } from './src/lib/ai-pipeline/4-ranking';
import { ItineraryGenerator } from './src/lib/ai-pipeline/5-generator';
import { ScheduleOptimizer } from './src/lib/ai-pipeline/6-optimizer';
import { BudgetPlanner } from './src/lib/ai-pipeline/7-budget';
import { ItineraryRefiner } from './src/lib/ai-pipeline/8-refiner';
import { PipelineState } from './src/lib/ai-pipeline/types';

async function run() {
  console.log("🚀 Starting Programmatic Itinerary Generation Test...");
  console.log(`Using model: ${process.env.GEMINI_MODEL || "gemini-3.5-flash"}`);

  const mockInput = {
    origin: "New York",
    destination: "Tokyo",
    startDate: "2026-08-20",
    endDate: "2026-08-25",
    travelers: 2,
    budget: 150000,
    budgetTier: "moderate",
    travelStyle: "Balanced",
    transportPreference: "Public transport",
    hotelCategory: "4-star",
    foodPreference: "Any",
    pace: "balanced",
    interests: ["Culture", "Food", "Sightseeing"],
  };

  try {
    console.log("\n1. Running Validator...");
    let state: PipelineState = TripInputValidator.validate(mockInput);
    console.log("✅ Validation successful!");

    console.log("\n2. Running Destination Analyzer...");
    state = await DestinationAnalyzer.analyze(state);
    console.log("✅ Destination context fetched!");
    console.log(`Overview: ${state.context.destinationOverview?.slice(0, 100)}...`);

    console.log("\n3. Running Place Discovery...");
    state = await PlaceDiscoveryService.discover(state);
    console.log(`✅ Discovered ${state.discoveredPlaces.length} places!`);

    console.log("\n4. Running Activity Ranking...");
    state = ActivityRankingService.rank(state);
    console.log(`✅ Ranked ${state.rankedPlaces.length} activities!`);

    console.log("\n5. Running Itinerary Generator (LLM)...");
    state = await ItineraryGenerator.generate(state);
    console.log("✅ Initial itinerary draft generated successfully!");

    console.log("\n6. Running Schedule Optimizer...");
    state = ScheduleOptimizer.optimize(state);
    console.log("✅ Route schedules optimized!");

    console.log("\n7. Running Budget Planner...");
    state = BudgetPlanner.plan(state);
    console.log("✅ Budget details plotted!");

    console.log("\n8. Running Itinerary Refiner...");
    state = await ItineraryRefiner.refine(state);
    console.log("✅ Itinerary refined and completed!");

    console.log("\n==================================================");
    console.log("🎉 ITINERARY GENERATED SUCCESSFULLY!");
    console.log("==================================================");
    console.log(`Destination: ${state.preferences.destination}`);
    console.log(`Duration: ${state.preferences.startDate} to ${state.preferences.endDate}`);
    console.log(`Days: ${state.finalItinerary?.days?.length || 0}`);
    console.log(`Budget Total Spent: ₹${state.budgetSummary?.total}`);
    console.log("==================================================");
    
    // Print Day 1 activities as preview
    if (state.finalItinerary?.days?.[0]) {
      console.log("\nDay 1 Preview:");
      state.finalItinerary.days[0].activities.forEach((act: any) => {
        console.log(`- [${act.startTime || 'Day'}] ${act.title} (${act.category}) - Cost: ₹${act.estimatedCost}`);
      });
    }

  } catch (error: any) {
    console.error("\n❌ Pipeline failed with error:", error);
  }
}

run();
