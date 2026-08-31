import { NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { inngest } from "@/inngest/client";

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const client = await clerkClient();
    const user = await client.users.getUser(userId);
    
    // Check if user is admin
    if (user.publicMetadata?.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const { users } = body;

    if (!users || !Array.isArray(users)) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    // Trigger background job via Inngest
    await inngest.send({
      name: "admin/bulk.import",
      data: { users }
    });

    return NextResponse.json({
      success: true,
      message: "Bulk import started in the background. You will be notified when it completes.",
      data: {
        totalQueued: users.length,
      }
    });

  } catch (error: any) {
    console.error("Bulk create users error:", error);
    return NextResponse.json(
      { error: "Failed to process bulk creation" },
      { status: 500 }
    );
  }
}
