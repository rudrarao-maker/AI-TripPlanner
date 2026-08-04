import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function GET(req: Request) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: trips, error } = await supabase
      .from("Trip")
      .select("*")
      .eq("userId", user.id)
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
