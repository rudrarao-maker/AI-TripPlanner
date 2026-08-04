import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { auth } from "@clerk/nextjs/server";

export async function GET(req: Request) {
  try {
    const supabase = await createClient();
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: trips, error } = await supabase
      .from("Trip")
      .select("*")
      .eq("userId", userId)
      .order("createdAt", { ascending: false });

    if (error) throw error;

    return NextResponse.json({ success: true, data: trips });
  } catch (error: any) {
    console.error("Fetch Trips Error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
