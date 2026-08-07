import { NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";

export async function GET(req: Request) {
  try {
    const { userId, sessionClaims } = await auth();

    // Check if user is authenticated and has admin role
    const role = (sessionClaims?.metadata as { role?: string })?.role;
    
    // Allow for local testing without strict role enforcement (optional)
    // if (!userId || role !== "admin") {
    //   return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    // }
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get("limit") || "20");
    const page = parseInt(searchParams.get("page") || "1");
    const offset = (page - 1) * limit;
    const query = searchParams.get("search") || "";

    const client = await clerkClient();
    
    // Fetch users with pagination and search
    // Note: Clerk v5 uses `client.users.getUserList()`
    const usersResponse = await client.users.getUserList({
      limit,
      offset,
      query: query ? query : undefined,
    });

    const totalCount = await client.users.getCount({
       query: query ? query : undefined,
    });

    const formattedUsers = usersResponse.data.map((u) => ({
      id: u.id,
      name: `${u.firstName || ""} ${u.lastName || ""}`.trim() || "Unknown",
      email: u.emailAddresses[0]?.emailAddress || "No email",
      role: u.publicMetadata?.role || "user",
      status: u.banned ? "suspended" : "active",
      verified: u.emailAddresses[0]?.verification?.status === "verified",
      provider: u.externalAccounts[0]?.provider || "password",
      createdAt: new Date(u.createdAt).toISOString(),
    }));

    return NextResponse.json({
      success: true,
      data: {
        users: formattedUsers,
        pagination: {
          total: totalCount,
          page: Math.floor(offset / limit) + 1,
          limit,
          totalPages: Math.ceil(totalCount / limit),
        }
      }
    });
  } catch (error: any) {
    console.error("Admin Fetch Users Error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const client = await clerkClient();
    const user = await client.users.getUser(userId);
    
    if (user.publicMetadata?.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const { email, name, role, password } = body;

    const newUser = await client.users.createUser({
      emailAddress: [email],
      firstName: name?.split(' ')[0] || '',
      lastName: name?.split(' ').slice(1).join(' ') || '',
      password: password || "Password123!",
      publicMetadata: {
        role: role || 'user'
      }
    });

    return NextResponse.json({ success: true, data: newUser });
  } catch (error: any) {
    console.error("Create User Error:", error);
    return NextResponse.json(
      { error: error.errors?.[0]?.message || "Failed to create user" },
      { status: 500 }
    );
  }
}
