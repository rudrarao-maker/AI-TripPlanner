import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createClient } from "@/utils/supabase/server";

export async function GET(req: Request) {
  try {
    const { userId, sessionClaims } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = await createClient();

    // Fetch total trips
    const { count: totalTrips, error: tripsError } = await supabase
      .from("Trip")
      .select("*", { count: "exact", head: true });

    if (tripsError) throw tripsError;

    // Fetch total bookings (mocked as 0 for now since we haven't implemented bookings table yet)
    const totalBookings = 0;
    
    // Fetch system revenue (mocked)
    const systemRevenue = 0;

    return NextResponse.json({
      success: true,
      data: {
        totalTrips: totalTrips || 0,
        totalBookings,
        systemRevenue,
      },
    });
  } catch (error: any) {
    console.error("Admin Fetch Stats Error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
