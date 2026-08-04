import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { auth } from "@clerk/nextjs/server";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const { data: trip, error } = await supabase
      .from("Trip")
      .select(`
        *,
        TripDay (
          *,
          Activity (*)
        )
      `)
      .eq("id", id)
      .eq("userId", userId)
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, data: trip });
  } catch (error: any) {
    console.error("Fetch Trip Error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();

    // To save the trip, we could update the Trip table, 
    // or specifically update Activities if that's what was passed
    if (body.activities) {
      for (const act of body.activities) {
        if (act.id) {
           await supabase.from("Activity").update(act).eq("id", act.id);
        } else {
           await supabase.from("Activity").insert(act);
        }
      }
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Update Trip Error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
