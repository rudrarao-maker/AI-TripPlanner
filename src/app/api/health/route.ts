import { NextResponse } from "next/server";
import { db } from "@/db";
import { sql } from "drizzle-orm";

const startTime = Date.now();

interface ServiceCheck {
  status: "healthy" | "unhealthy" | "degraded";
  latencyMs?: number;
  error?: string;
  details?: string;
}

async function checkDatabase(): Promise<ServiceCheck> {
  try {
    const start = Date.now();
    await db.execute(sql`SELECT 1`);
    return { status: "healthy", latencyMs: Date.now() - start };
  } catch (error: any) {
    return { status: "unhealthy", error: error.message };
  }
}

async function checkRedis(): Promise<ServiceCheck> {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token || url.includes("dummy")) {
    return { status: "degraded", details: "Not configured" };
  }

  try {
    const start = Date.now();
    const res = await fetch(`${url}/ping`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (data.result === "PONG") {
      return { status: "healthy", latencyMs: Date.now() - start };
    }
    return { status: "unhealthy", error: "Unexpected response" };
  } catch (error: any) {
    return { status: "unhealthy", error: error.message };
  }
}

async function checkExternalAPI(name: string, url: string): Promise<ServiceCheck> {
  try {
    const start = Date.now();
    const res = await fetch(url, { method: "HEAD", signal: AbortSignal.timeout(5000) });
    return {
      status: res.status < 500 ? "healthy" : "degraded",
      latencyMs: Date.now() - start,
      details: res.ok ? "OK" : `HTTP ${res.status}`,
    };
  } catch (error: any) {
    return { status: "unhealthy", error: error.message };
  }
}

function checkEnvVars(): ServiceCheck {
  const required = [
    "DATABASE_URL",
    "CLERK_SECRET_KEY",
    "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY",
    "GEMINI_API_KEY",
    "NEXT_PUBLIC_GOOGLE_MAPS_API_KEY",
    "STRIPE_SECRET_KEY",
  ];

  const missing = required.filter((key) => !process.env[key]);

  if (missing.length === 0) {
    return { status: "healthy", details: `${required.length}/${required.length} configured` };
  }
  return {
    status: missing.length > 2 ? "unhealthy" : "degraded",
    details: `Missing: ${missing.join(", ")}`,
  };
}

export async function GET() {
  const [database, redis, clerk, envVars] = await Promise.all([
    checkDatabase(),
    checkRedis(),
    checkExternalAPI("Clerk", "https://api.clerk.com"),
    Promise.resolve(checkEnvVars()),
  ]);

  const checks = { database, redis, clerk, envVars };

  // Overall status logic
  const statuses = Object.values(checks).map((c) => c.status);
  let overall: "healthy" | "degraded" | "unhealthy" = "healthy";

  if (statuses.includes("unhealthy")) {
    // If database is down = unhealthy; if optional service is down = degraded
    overall = checks.database.status === "unhealthy" ? "unhealthy" : "degraded";
  } else if (statuses.includes("degraded")) {
    overall = "degraded";
  }

  const memUsage = process.memoryUsage();

  return NextResponse.json(
    {
      status: overall,
      emoji: overall === "healthy" ? "🟢" : overall === "degraded" ? "🟡" : "🔴",
      uptime: `${Math.round((Date.now() - startTime) / 1000)}s`,
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || "1.0.0",
      environment: process.env.NODE_ENV || "production",
      region: process.env.VERCEL_REGION || "unknown",
      checks,
      memory: {
        heapUsedMB: Math.round(memUsage.heapUsed / 1024 / 1024),
        heapTotalMB: Math.round(memUsage.heapTotal / 1024 / 1024),
        rssMB: Math.round(memUsage.rss / 1024 / 1024),
      },
    },
    { status: overall === "healthy" ? 200 : overall === "degraded" ? 200 : 503 }
  );
}
