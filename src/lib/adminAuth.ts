import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/db";
import { users, auditLogs } from "@/db/schema";
import { eq } from "drizzle-orm";

type AdminHandler = (req: Request, context: { adminId: string; params: any }) => Promise<NextResponse>;

export function withAdminAuth(handler: AdminHandler, actionName: string) {
  return async (req: Request, context: any) => {
    try {
      const { userId } = await auth();

      if (!userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      // Verify if the user is an admin in the database
      const user = await db.query.users.findFirst({
        where: eq(users.clerkId, userId),
      });

      // Allow if user is an admin or super_admin
      // In development/mock scenarios where we just created the project, 
      // we might want to temporarily bypass this if there's no way to set the first admin.
      // But for production readiness, we strictly enforce it.
      if (!user || (user.role !== "admin" && user.role !== "super_admin")) {
         return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 });
      }

      // Execute the actual handler
      const response = await handler(req, { ...context, adminId: user.id });

      // Audit Logging
      if (req.method !== "GET") {
        try {
          await db.insert(auditLogs).values({
            adminId: user.id,
            action: actionName,
            targetType: new URL(req.url).pathname, // Route path as targetType
            details: `Method: ${req.method}`,
          });
        } catch (logError) {
          console.error("Failed to write audit log:", logError);
        }
      }

      return response;
    } catch (error: any) {
      console.error(`Admin API Error (${actionName}):`, error);
      return NextResponse.json(
        { error: "Internal Server Error", details: error.message },
        { status: 500 }
      );
    }
  };
}
