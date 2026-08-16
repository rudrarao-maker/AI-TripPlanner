import { NextResponse } from "next/server";
import { clerkClient } from "@clerk/nextjs/server";
import { withAdminAuth } from "@/lib/adminAuth";

async function updateUserHandler(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const updates: any = {};
    
    const client = await clerkClient();

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

async function deleteUserHandler(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const client = await clerkClient();
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

export const PUT = (req: Request, ctx: any) => withAdminAuth(updateUserHandler, "UPDATE_USER")(req, ctx);
export const DELETE = (req: Request, ctx: any) => withAdminAuth(deleteUserHandler, "DELETE_USER")(req, ctx);
