import { NextRequest, NextResponse } from "next/server";
import { autoRescheduleDay } from "@/lib/ai-pipeline/auto-rebook";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    // In a real webhook from FlightAware or AviationStack, you would get a flight IATA code
    // and look up which trip/user that belongs to in your DB.
    // For this demo, we accept the current activities directly in the payload.
    const { flightNumber, delayMinutes, currentActivities } = body;

    if (!flightNumber || !delayMinutes || !currentActivities) {
      return NextResponse.json(
        { success: false, error: "Missing required payload (flightNumber, delayMinutes, currentActivities)" },
        { status: 400 }
      );
    }

    console.log(`[Webhook] Flight ${flightNumber} delayed by ${delayMinutes} mins. Initiating auto-rebook...`);

    const rescheduledData = await autoRescheduleDay(currentActivities, delayMinutes, flightNumber);

    return NextResponse.json({ success: true, data: rescheduledData });
  } catch (error: any) {
    console.error("Flight Tracker Webhook Error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Internal Server Error during auto-rebooking" },
      { status: 500 }
    );
  }
}
