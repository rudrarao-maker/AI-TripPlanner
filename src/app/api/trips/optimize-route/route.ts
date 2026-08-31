import { NextResponse } from "next/server";
import { RouteOptimizer } from "@/lib/ai-pipeline/multi-destination/2-route-optimizer";
import { DestinationEntry } from "@/lib/ai-pipeline/types";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const destinationsInput: DestinationEntry[] = body.destinations;

    if (!destinationsInput || destinationsInput.length < 3) {
       return NextResponse.json({ error: "Need at least 3 destinations to optimize" }, { status: 400 });
    }

    // Mock state just enough for the optimizer
    const mockState: any = {
      destinationEntries: destinationsInput,
      warnings: [],
    };

    const optimizedState = RouteOptimizer.optimize(mockState);

    return NextResponse.json({
      success: true,
      routeOptimizationSuggested: optimizedState.routeOptimizationSuggested,
      optimizedOrder: optimizedState.optimizedOrder,
      warnings: optimizedState.warnings,
    });
  } catch (error) {
    console.error("Error optimizing route:", error);
    return NextResponse.json({ error: "Failed to optimize route" }, { status: 500 });
  }
}
