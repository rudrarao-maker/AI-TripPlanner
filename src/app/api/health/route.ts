import { NextResponse } from "next/server";
import { db } from "@/db";
import { sql } from "drizzle-orm";

const startTime = Date.now();

export async function GET() {
  const checks: Record<string, { status: string; latencyMs?: number; error?: string }> = {};

  // Check database connectivity
  try {
    const dbStart = Date.now();
    await db.execute(sql`SELECT 1`);
    checks.database = { status: "healthy", latencyMs: Date.now() - dbStart };
  } catch (error: any) {
    checks.database = { status: "unhealthy", error: error.message };
  }

  // Memory usage
  const memUsage = process.memoryUsage();

  // Overall status
  const isHealthy = Object.values(checks).every((c) => c.status === "healthy");

  return NextResponse.json(
    {
      status: isHealthy ? "healthy" : "degraded",
      uptime: Math.round((Date.now() - startTime) / 1000),
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || "1.0.0",
      environment: process.env.NODE_ENV || "development",
      checks,
      memory: {
        heapUsedMB: Math.round(memUsage.heapUsed / 1024 / 1024),
        heapTotalMB: Math.round(memUsage.heapTotal / 1024 / 1024),
        rssMB: Math.round(memUsage.rss / 1024 / 1024),
      },
    },
    { status: isHealthy ? 200 : 503 }
  );
}
