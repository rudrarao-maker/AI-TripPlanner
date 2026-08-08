import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/db";
import { users, auditLogs } from "@/db/schema";
import { eq } from "drizzle-orm";
import { logger } from "@/lib/logger";
import { applyRateLimit, adminApiLimit } from "@/lib/apiRateLimit";

type AdminHandler = (req: Request, context: { adminId: string; params: any }) => Promise<NextResponse>;

export function withAdminAuth(handler: AdminHandler, actionName: string) {
  return async (req: Request, context: any) => {
    try {
      const { userId } = await auth();

      if (!userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      // Apply rate limiting for admin APIs
      const rateResult = await applyRateLimit(adminApiLimit, `admin:${userId}`);
      if (!rateResult.allowed) {
        return NextResponse.json(
          { error: "Rate limit exceeded. Please slow down." },
          { status: 429, headers: rateResult.headers }
        );
      }

      // Verify the user has admin role in the database
      const user = await db.query.users.findFirst({
        where: eq(users.clerkId, userId),
      });

      if (!user || (user.role !== "admin" && user.role !== "super_admin")) {
        logger.warn("Admin access denied", { userId, role: user?.role, action: actionName });
        return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 });
      }

      // Execute the actual handler
      const response = await handler(req, { ...context, adminId: user.id });

      // Audit Logging for mutating operations
      if (req.method !== "GET") {
        try {
          await db.insert(auditLogs).values({
            adminId: user.id,
            action: actionName,
            targetType: new URL(req.url).pathname,
            details: `Method: ${req.method}`,
          });
        } catch (logError) {
          logger.error("Failed to write audit log", { error: logError, action: actionName });
        }
      }

      return response;
    } catch (error: any) {
      logger.error(`Admin API Error (${actionName})`, { error: error.message, stack: error.stack });
      return NextResponse.json(
        { error: "Internal Server Error" },
        { status: 500 }
      );
    }
  };
}
