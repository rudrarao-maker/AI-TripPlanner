import { NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";

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

    const created = [];
    const skipped = [];

    // Process sequentially to avoid rate limiting
    for (const u of users) {
      try {
        const newUser = await client.users.createUser({
          emailAddress: [u.email],
          firstName: u.name?.split(' ')[0] || '',
          lastName: u.name?.split(' ').slice(1).join(' ') || '',
          password: "Password123!",
          publicMetadata: {
            role: u.role || 'user'
          }
        });
        created.push(newUser);
      } catch (error: any) {
        console.error(`Failed to create user ${u.email}:`, error.errors?.[0]?.message || error.message);
        skipped.push({ email: u.email, reason: error.errors?.[0]?.message || error.message });
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        created,
        skipped
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
