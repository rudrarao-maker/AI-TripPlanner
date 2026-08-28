import { NextRequest, NextResponse } from "next/server";
import { fetchLivePrice } from "@/lib/booking-api/live-pricing";

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const name = searchParams.get("name");
    const category = searchParams.get("category");
    const location = searchParams.get("location");

    if (!name || !category || !location) {
      return NextResponse.json(
        { success: false, error: "Missing required parameters (name, category, location)" },
        { status: 400 }
      );
    }

    const liveData = await fetchLivePrice(name, category, location);

    if (!liveData) {
      return NextResponse.json(
        { success: false, error: "Live pricing unavailable for this item." },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: liveData });
  } catch (error) {
    console.error("Live Pricing API Error:", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error while fetching live prices" },
      { status: 500 }
    );
  }
}
