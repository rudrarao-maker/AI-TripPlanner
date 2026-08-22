import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/db";
import { trips, tripDestinations } from "@/db/schema";
import { eq, and, asc } from "drizzle-orm";
import { RouteOptimizer } from "@/lib/ai-pipeline/multi-destination/2-route-optimizer";
import { DestinationEntry } from "@/lib/ai-pipeline/types";

export async function POST(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    const params = await props.params;
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const trip = await db.query.trips.findFirst({
      where: and(eq(trips.id, params.id), eq(trips.userId, userId)),
    });
    if (!trip) return NextResponse.json({ error: "Trip not found" }, { status: 404 });

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
