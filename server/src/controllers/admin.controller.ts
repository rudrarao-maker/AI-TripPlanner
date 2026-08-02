import { Request, Response } from "express";
import { sendSuccess, sendError } from "../utils/response";
import prisma from "../utils/prisma";
import { clerkClient } from "@clerk/express";

export const getDashboardOverview = async (req: Request, res: Response) => {
  try {
    const totalUsers = await prisma.user.count();
    const totalTrips = await prisma.trip.count();
    
    // Total Revenue is sum of confirmed bookings
    const bookings = await prisma.booking.aggregate({
      _sum: {
        totalAmount: true
      },
      where: {
        status: "confirmed"
      }
    });

    const totalRevenue = bookings._sum.totalAmount ? Number(bookings._sum.totalAmount) : 0;
    
    // Server load is just mock for now
    const serverLoad = Math.floor(Math.random() * 20) + 30; // 30-50%

    // Recent signups
    const recentSignups = await prisma.user.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        avatar: true
      }
    });

    sendSuccess(res, 200, {
      stats: {
        totalUsers,
        totalTrips,
        totalRevenue,
        serverLoad
      },
      recentSignups
    });
  } catch (error) {
    console.error("Failed to get dashboard overview:", error);
    sendError(res, 500, "Failed to retrieve overview stats");
  }
};

export const getAiUsageStats = async (req: Request, res: Response) => {
  try {
    // Total stats
    const totalCalls = await prisma.aiUsageLog.count();

    // Success rate and latency
    const logs = await prisma.aiUsageLog.findMany({
      take: 1000, // Look at last 1000 for averages
      orderBy: { createdAt: "desc" },
    });

    const successCount = logs.filter((l) => l.status === "success").length;
    const errorRate =
      totalCalls === 0 ? 0 : ((logs.length - successCount) / logs.length) * 100;

    const totalLatency = logs.reduce((acc, log) => acc + log.latencyMs, 0);
    const avgLatency =
      logs.length > 0 ? Math.round(totalLatency / logs.length) : 0;

    const totalTokens = await prisma.aiUsageLog.aggregate({
      _sum: { tokens: true },
    });

    // Recent Prompts
    const recentPrompts = await prisma.aiUsageLog.findMany({
      take: 10,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        prompt: true,
        latencyMs: true,
        status: true,
        createdAt: true,
      },
    });

    // Real chart data (last 12 days)
    const twelveDaysAgo = new Date();
    twelveDaysAgo.setDate(twelveDaysAgo.getDate() - 11);
    twelveDaysAgo.setHours(0, 0, 0, 0);

    const recentLogsForChart = await prisma.aiUsageLog.findMany({
      where: { createdAt: { gte: twelveDaysAgo } },
      select: { createdAt: true },
    });

    const dailyCounts: Record<string, number> = {};
    for (let i = 0; i < 12; i++) {
      const d = new Date(twelveDaysAgo);
      d.setDate(d.getDate() + i);
      dailyCounts[d.toISOString().split("T")[0]] = 0;
    }

    recentLogsForChart.forEach(log => {
      const dateStr = log.createdAt.toISOString().split("T")[0];
      if (dailyCounts[dateStr] !== undefined) {
        dailyCounts[dateStr]++;
      }
    });

    const chartData = Object.values(dailyCounts);

    sendSuccess(res, 200, {
      stats: {
        totalCalls,
        avgLatency,
        totalTokens: totalTokens._sum.tokens || 0,
        errorRate: errorRate.toFixed(2),
      },
      recentPrompts: recentPrompts.map((p) => ({
        query: p.prompt,
        time: p.createdAt,
        status: p.status === "success" ? "Success" : "Failed",
        ms: p.latencyMs,
      })),
      chartData,
    });
  } catch (error) {
    console.error("Failed to get AI usage stats:", error);
    sendError(res, 500, "Failed to retrieve stats");
  }
};

export const changeUserPassword = async (req: Request, res: Response) => {
  try {
    const userId = req.params.id as string;
    const { newPassword } = req.body;

    if (!newPassword || newPassword.length < 6) {
      return sendError(res, 400, "Password must be at least 6 characters long");
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return sendError(res, 404, "User not found");
    }

    // Update password in Clerk
    if (user.clerkId) {
      await clerkClient.users.updateUser(user.clerkId, { password: newPassword });
      sendSuccess(res, 200, null, "User password updated successfully in Clerk");
    } else {
      sendError(res, 400, "User is not linked to Clerk");
    }
  } catch (error) {
    console.error("Failed to update user password:", error);
    sendError(res, 500, "Failed to update user password");
  }
};
