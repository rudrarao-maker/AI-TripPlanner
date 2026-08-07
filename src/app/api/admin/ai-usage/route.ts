import { NextResponse } from "next/server";
import { withAdminAuth } from "@/lib/adminAuth";

async function getAiUsageHandler(req: Request) {
  // Since AI calls might not be logged to DB directly yet, mock analytics for the dashboard
  const mockData = {
    stats: {
      totalCalls: 124593,
      avgLatency: 845,
      totalTokens: 25489000,
      errorRate: 0.2
    },
    recentPrompts: [
      { query: "Generate a 3-day itinerary for Paris", time: new Date().toISOString(), ms: 1200, status: "Success" },
      { query: "Find cheap hotels in Tokyo", time: new Date(Date.now() - 3600000).toISOString(), ms: 800, status: "Success" },
      { query: "Recommend restaurants in New York", time: new Date(Date.now() - 7200000).toISOString(), ms: 450, status: "Success" },
      { query: "Plan a trip to Mars", time: new Date(Date.now() - 10800000).toISOString(), ms: 3000, status: "Failed" }
    ],
    chartData: Array.from({ length: 24 }, () => Math.floor(Math.random() * 100))
  };

  return NextResponse.json({ success: true, data: mockData });
}

export const GET = (req: Request, ctx: any) => withAdminAuth(getAiUsageHandler, "FETCH_AI_STATS")(req, ctx);
