"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.changeUserPassword = exports.getAiUsageStats = void 0;
const response_1 = require("../utils/response");
const client_1 = require("@prisma/client");
const express_1 = require("@clerk/express");
const prisma = new client_1.PrismaClient();
const getAiUsageStats = async (req, res) => {
    try {
        // Total stats
        const totalCalls = await prisma.aiUsageLog.count();
        // Success rate and latency
        const logs = await prisma.aiUsageLog.findMany({
            take: 1000, // Look at last 1000 for averages
            orderBy: { createdAt: "desc" },
        });
        const successCount = logs.filter((l) => l.status === "success").length;
        const errorRate = totalCalls === 0 ? 0 : ((logs.length - successCount) / logs.length) * 100;
        const totalLatency = logs.reduce((acc, log) => acc + log.latencyMs, 0);
        const avgLatency = logs.length > 0 ? Math.round(totalLatency / logs.length) : 0;
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
        (0, response_1.sendSuccess)(res, 200, {
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
    }
    catch (error) {
        console.error("Failed to get AI usage stats:", error);
        (0, response_1.sendError)(res, 500, "Failed to retrieve stats");
    }
};
exports.getAiUsageStats = getAiUsageStats;
const changeUserPassword = async (req, res) => {
    try {
        const userId = req.params.id;
        const { newPassword } = req.body;
        if (!newPassword || newPassword.length < 6) {
            return (0, response_1.sendError)(res, 400, "Password must be at least 6 characters long");
        }
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) {
            return (0, response_1.sendError)(res, 404, "User not found");
        }
        // Update password in Clerk
        if (user.clerkId) {
            await express_1.clerkClient.users.updateUser(user.clerkId, { password: newPassword });
        }
        // Still update local DB for consistency if needed
        const bcrypt = require("bcryptjs");
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);
        await prisma.user.update({
            where: { id: userId },
            data: { password: hashedPassword },
        });
        (0, response_1.sendSuccess)(res, 200, null, "User password updated successfully");
    }
    catch (error) {
        console.error("Failed to update user password:", error);
        (0, response_1.sendError)(res, 500, "Failed to update user password");
    }
};
exports.changeUserPassword = changeUserPassword;
