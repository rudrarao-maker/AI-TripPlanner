/**
 * Audit Logger Utility
 * Centralizes logging for critical system and user actions.
 * In a full production environment, this would push directly to an `audit_logs`
 * table in Supabase or a specialized logging service like Datadog/Sentry.
 */

export interface AuditLogDetails {
  action: string;
  userId?: string | null;
  tripId?: string | null;
  metadata?: Record<string, any>;
}

export async function logAuditAction({ action, userId, tripId, metadata }: AuditLogDetails) {
  const logEntry = {
    timestamp: new Date().toISOString(),
    level: "AUDIT",
    action,
    userId: userId || "SYSTEM",
    tripId: tripId || "N/A",
    metadata: metadata || {},
  };

  // 1. Output to standard server logs (viewable in Vercel/Render)
  console.log(JSON.stringify(logEntry));

  // 2. (Optional) Push to Database
  // if (process.env.DATABASE_URL) {
  //   try {
  //     await db.insert(audit_logs).values({
  //       action: logEntry.action,
  //       user_id: logEntry.userId,
  //       trip_id: logEntry.tripId,
  //       metadata: logEntry.metadata
  //     });
  //   } catch (error) {
  //     console.error("Failed to write audit log to database:", error);
  //   }
  // }
}
