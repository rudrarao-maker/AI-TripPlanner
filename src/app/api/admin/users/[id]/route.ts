import { NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const client = await clerkClient();
    const user = await client.users.getUser(userId);
    
    if (user.publicMetadata?.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const updates: any = {};
    
    if (body.role) {
      updates.publicMetadata = { role: body.role };
    }
    if (body.name) {
      updates.firstName = body.name.split(' ')[0];
      updates.lastName = body.name.split(' ').slice(1).join(' ');
    }
    if (body.status) {
      if (body.status === 'restricted' || body.status === 'suspended') {
        await client.users.banUser(id);
      } else if (body.status === 'active') {
        await client.users.unbanUser(id);
      }
    }

    if (Object.keys(updates).length > 0) {
      await client.users.updateUser(id, updates);
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Update User Error:", error);
    return NextResponse.json(
      { error: error.errors?.[0]?.message || "Failed to update user" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const client = await clerkClient();
    const user = await client.users.getUser(userId);
    
    if (user.publicMetadata?.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await client.users.deleteUser(id);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Delete User Error:", error);
    return NextResponse.json(
      { error: error.errors?.[0]?.message || "Failed to delete user" },
      { status: 500 }
    );
  }
}
