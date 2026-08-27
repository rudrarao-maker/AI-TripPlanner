import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { TripInputValidator } from "@/lib/ai-pipeline/1-validator";
import { DestinationAnalyzer } from "@/lib/ai-pipeline/2-destination";
import { PlaceDiscoveryService } from "@/lib/ai-pipeline/3-place-discovery";
import { ActivityRankingService } from "@/lib/ai-pipeline/4-ranking";
import { ItineraryGenerator } from "@/lib/ai-pipeline/5-generator";
import { ScheduleOptimizer } from "@/lib/ai-pipeline/6-optimizer";
import { BudgetPlanner } from "@/lib/ai-pipeline/7-budget";
import { ItineraryRefiner } from "@/lib/ai-pipeline/8-refiner";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { PipelineState, MultiDestPipelineState } from "@/lib/ai-pipeline/types";
import { MultiDestValidator } from "@/lib/ai-pipeline/multi-destination/1-multi-validator";
import { RouteOptimizer } from "@/lib/ai-pipeline/multi-destination/2-route-optimizer";
import { TransportPlanner } from "@/lib/ai-pipeline/multi-destination/3-transport-planner";
import { MultiDiscovery } from "@/lib/ai-pipeline/multi-destination/4-multi-discovery";
import { MultiRanking } from "@/lib/ai-pipeline/multi-destination/5-multi-ranking";
import { MultiItineraryGenerator } from "@/lib/ai-pipeline/multi-destination/6-multi-generator";
import { MultiBudgetPlanner } from "@/lib/ai-pipeline/multi-destination/7-multi-budget";
import { MultiRefiner } from "@/lib/ai-pipeline/multi-destination/8-multi-refiner";
import { ratelimit } from "@/lib/ratelimit";
import { logger } from "@/lib/logger";

export const maxDuration = 120; // Multi-dest may need more time

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (ratelimit) {
      const { success } = await ratelimit.limit(userId);
      if (!success) {
        return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
      }
    }

    const input = await req.json();
    const isMultiDest = input.isMultiDestination === true;
    
    // Fetch user records to check limits and preferences
    try {
      const userRecords = await db.select().from(users).where(eq(users.clerkId, userId));
      if (userRecords.length > 0) {
        const user = userRecords[0];
        
        // Subscription & Credit check
        const isPro = user.planType === 'pro' || user.subscriptionStatus === 'active';
        const credits = user.tripCredits ?? 0;
        
        if (!isPro && credits <= 0) {
          return NextResponse.json({ 
            error: "You have run out of free trips! Upgrade to Pro for unlimited trips.",
            requiresUpgrade: true 
          }, { status: 403 });
        }
        
        // Deduct credit if on free plan
        if (!isPro && credits > 0) {
          await db.update(users).set({ tripCredits: credits - 1 }).where(eq(users.id, user.id));
        }

        if (user.preferencesProfile) {
          input.userProfileWeights = user.preferencesProfile;
        }
      }
    } catch (e) {
      console.error("Failed to fetch user data:", e);
    }

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        const sendUpdate = (step: string, status: string, message?: string) => {
          const data = JSON.stringify({ step, status, message });
          controller.enqueue(encoder.encode(`data: ${data}\n\n`));
        };

        try {
          if (isMultiDest) {
            await runMultiDestPipeline(input, sendUpdate);
          } else {
            await runSingleDestPipeline(input, sendUpdate);
          }
        } catch (error: any) {
          logger.error("Pipeline Error", { error: error.message, input });
          const errPayload = JSON.stringify({
            step: "error",
            status: "error",
            message: error.message || "Failed to generate itinerary.",
          });
          controller.enqueue(encoder.encode(`data: ${errPayload}\n\n`));
        } finally {
          controller.close();
        }
      }
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
      },
    });
  } catch (error: any) {
    logger.error("Global route error", { error: error.message });
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// ===== Single-Destination Pipeline =====
async function runSingleDestPipeline(
  input: any,
  sendUpdate: (step: string, status: string, message?: string) => void
) {
  sendUpdate("validator", "running", "Understanding your trip...");
  let state: PipelineState = TripInputValidator.validate(input);
  sendUpdate("validator", "done");

  sendUpdate("destination", "running", "Analyzing destination and discovering places...");
  
  const [destState, placesState] = await Promise.all([
    DestinationAnalyzer.analyze({ ...state }),
    PlaceDiscoveryService.discover({ ...state })
  ]);
  
  // Merge the parallel results back into state
  state = {
    ...state,
    context: destState.context,
    discoveredPlaces: placesState.discoveredPlaces,
    warnings: [...(destState.warnings || []), ...(placesState.warnings || [])]
  };
  
  sendUpdate("destination", "done");
  sendUpdate("discovery", "done");

  sendUpdate("ranking", "running", "Analyzing your preferences...");
  state = ActivityRankingService.rank(state);
  sendUpdate("ranking", "done");

  sendUpdate("generator", "running", "Building your initial itinerary...");
  state = await ItineraryGenerator.generate(state, (partial) => {
    sendUpdate("generator_stream", "streaming", JSON.stringify(partial));
  });
  sendUpdate("generator", "done");

  sendUpdate("optimizer", "running", "Optimizing travel routes...");
  state = await ScheduleOptimizer.optimize(state);
  sendUpdate("optimizer", "done");

  sendUpdate("budget", "running", "Planning your budget...");
  state = BudgetPlanner.plan(state);
  sendUpdate("budget", "done");

  sendUpdate("refiner", "running", "Finalizing details...");
  state = await ItineraryRefiner.refine(state);
  sendUpdate("refiner", "done");

  // Send final payload using the same sendUpdate mechanism
  sendUpdate("complete", "success", JSON.stringify({
    isMultiDestination: false,
    itinerary: state.finalItinerary,
    budgetSummary: state.budgetSummary,
    warnings: state.warnings,
  }));
}

// ===== Multi-Destination Pipeline =====
async function runMultiDestPipeline(
  input: any,
  sendUpdate: (step: string, status: string, message?: string) => void
) {
  const destCount = input.destinationEntries?.length || 0;

  sendUpdate("validator", "running", `Validating ${destCount} destinations...`);
  let state: MultiDestPipelineState = MultiDestValidator.validate(input);
  sendUpdate("validator", "done");

  sendUpdate("route_optimizer", "running", "Optimizing destination order...");
  state = RouteOptimizer.optimize(state);
  sendUpdate("route_optimizer", "done");

  sendUpdate("transport", "running", "Planning inter-city transport...");
  state = await TransportPlanner.plan(state);
  sendUpdate("transport", "done");

  sendUpdate("discovery", "running", `Finding places across ${destCount} destinations...`);
  state = await MultiDiscovery.discover(state);
  sendUpdate("discovery", "done");

  sendUpdate("ranking", "running", "Ranking activities per destination...");
  state = MultiRanking.rank(state);
  sendUpdate("ranking", "done");

  sendUpdate("generator", "running", "Building your multi-city itinerary...");
  state = await MultiItineraryGenerator.generate(state);
  sendUpdate("generator", "done");

  sendUpdate("budget", "running", "Calculating complete budget...");
  state = MultiBudgetPlanner.plan(state);
  sendUpdate("budget", "done");

  sendUpdate("refiner", "running", "Finalizing your journey...");
  state = await MultiRefiner.refine(state);
  sendUpdate("refiner", "done");

  sendUpdate("complete", "success", JSON.stringify({
    isMultiDestination: true,
    itinerary: state.multiDestItinerary,
    budgetSummary: state.budgetSummary,
    warnings: state.warnings,
    routeOptimizationSuggested: state.routeOptimizationSuggested,
    optimizedOrder: state.optimizedOrder,
  }));
}
