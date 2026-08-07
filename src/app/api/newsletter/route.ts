import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const beehiivPubId = process.env.BEEHIIV_PUBLICATION_ID;
    const beehiivApiKey = process.env.BEEHIIV_API_KEY;

    if (!beehiivPubId || !beehiivApiKey) {
      console.warn("Beehiiv keys not configured. Simulating success.");
      return NextResponse.json({ success: true, simulated: true });
    }

    const response = await fetch(`https://api.beehiiv.com/v2/publications/${beehiivPubId}/subscriptions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${beehiivApiKey}`
      },
      body: JSON.stringify({
        email,
        reactivate_existing: true,
        send_welcome_email: true,
        utm_source: "trip_planner",
        utm_medium: "website"
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to subscribe");
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Beehiiv Error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
