"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAppStats = void 0;
const client_1 = require("@prisma/client");
const response_1 = require("../utils/response");
const prisma = new client_1.PrismaClient();
const getAppStats = async (req, res) => {
    try {
        const [tripsCount, usersCount, hotelsCount, attractionsCount] = await Promise.all([
            prisma.trip.count(),
            prisma.user.count(),
            prisma.hotel.count(),
            prisma.attraction.count(),
        ]);
        // Added base value for a "started" look if db has little data
        const baseTrips = 50000;
        const baseUsers = 120000;
        const baseDestinations = 500;
        const stats = [
            { label: "Trips Planned", value: baseTrips + tripsCount, suffix: "+" },
            { label: "Happy Travelers", value: baseUsers + usersCount, suffix: "+" },
            {
                label: "Destinations",
                value: baseDestinations + hotelsCount + attractionsCount,
                suffix: "+",
            },
            {
                label: "AI Recommendations",
                value: (baseTrips + tripsCount) * 15,
                suffix: "+",
            },
        ];
        (0, response_1.sendSuccess)(res, 200, stats, "Stats fetched successfully");
    }
    catch (error) {
        console.error("Failed to fetch app stats:", error);
        (0, response_1.sendError)(res, 500, "Failed to fetch app stats");
    }
};
exports.getAppStats = getAppStats;
