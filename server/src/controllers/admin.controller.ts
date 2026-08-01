import { Request, Response } from "express";
import { sendSuccess, sendError } from "../utils/response";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

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

    // Mock chart data for now, ideally group by hour/day
    const chartData = [
      40,
      70,
      45,
      90,
      65,
      80,
      100,
      85,
      60,
      75,
      50,
      Math.min(totalCalls, 100),
    ];

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

    // In a full Clerk implementation, we would call clerkClient.users.updateUser(user.clerkId, { password: newPassword })
    // For local database fallback, we update the local password record.
    const bcrypt = require("bcryptjs");
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    sendSuccess(res, 200, null, "User password updated successfully");
  } catch (error) {
    console.error("Failed to update user password:", error);
    sendError(res, 500, "Failed to update user password");
  }
};
