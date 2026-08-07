import { NextResponse } from "next/server";
import { db } from "@/db";
import { auditLogs } from "@/db/schema";
import { withAdminAuth } from "@/lib/adminAuth";
import { desc, ilike, or } from "drizzle-orm";

async function getAuditLogsHandler(req: Request) {
  const url = new URL(req.url);
  const search = url.searchParams.get("search") || "";
  
  let conditions = undefined;
  if (search) {
    conditions = or(
      ilike(auditLogs.action, `%${search}%`),
      ilike(auditLogs.details, `%${search}%`)
    );
  }

  const allLogs = await db.query.auditLogs.findMany({
    where: conditions,
    with: {
      admin: {
        columns: {
          name: true,
          email: true,
        }
      }
    },
    orderBy: [desc(auditLogs.createdAt)],
    limit: 200
  });

  return NextResponse.json({ success: true, data: { logs: allLogs } });
}

export const GET = (req: Request, ctx: any) => withAdminAuth(getAuditLogsHandler, "FETCH_AUDIT_LOGS")(req, ctx);
