import { NextResponse } from "next/server";
import { clerkClient } from "@clerk/nextjs/server";
import { withAdminAuth } from "@/lib/adminAuth";

async function getUsersHandler(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get("limit") || "20");
    const page = parseInt(searchParams.get("page") || "1");
    const offset = (page - 1) * limit;
    const query = searchParams.get("search") || "";

    const client = await clerkClient();
    
    // Fetch users with pagination and search
    const usersResponse = await client.users.getUserList({
      limit,
      offset,
      query: query ? query : undefined,
    });

    const totalCount = await client.users.getCount({
       query: query ? query : undefined,
    });

    // Trimming API responses: Only returning necessary, non-sensitive fields
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

async function createUserHandler(req: Request) {
  try {
    const body = await req.json();
    const { email, name, role, password } = body;

    const client = await clerkClient();
    const newUser = await client.users.createUser({
      emailAddress: [email],
      firstName: name?.split(' ')[0] || '',
      lastName: name?.split(' ').slice(1).join(' ') || '',
      password: password || "Password123!",
      publicMetadata: {
        role: role || 'user'
      }
    });

    // Trim output
    const trimmedUser = {
      id: newUser.id,
      name: `${newUser.firstName || ""} ${newUser.lastName || ""}`.trim(),
      email: newUser.emailAddresses[0]?.emailAddress,
      role: newUser.publicMetadata?.role,
    };

    return NextResponse.json({ success: true, data: trimmedUser });
  } catch (error: any) {
    console.error("Create User Error:", error);
    return NextResponse.json(
      { error: error.errors?.[0]?.message || "Failed to create user" },
      { status: 500 }
    );
  }
}

export const GET = (req: Request, ctx: any) => withAdminAuth(getUsersHandler, "FETCH_USERS")(req, ctx);
export const POST = (req: Request, ctx: any) => withAdminAuth(createUserHandler, "CREATE_USER")(req, ctx);
