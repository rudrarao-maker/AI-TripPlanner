"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAlternativeActivity = exports.regenerateTripDay = exports.getTripById = exports.getUserTrips = exports.generateTrip = exports.parseUserPrompt = void 0;
const client_1 = require("@prisma/client");
const aiService = __importStar(require("./ai.service"));
const errorHandler_1 = require("../middlewares/errorHandler");
const prisma = new client_1.PrismaClient();
const parseUserPrompt = async (prompt) => {
    return await aiService.parseUserPrompt(prompt);
};
exports.parseUserPrompt = parseUserPrompt;
const generateTrip = async (userId, tripData) => {
    // 1. Ask AI to generate the itinerary
    const generatedItinerary = await aiService.generateItinerary(tripData);
    // 2. Save the Trip to DB
    const trip = await prisma.trip.create({
        data: {
            userId,
            title: generatedItinerary.title,
            origin: tripData.origin,
            destination: tripData.destination,
            startDate: new Date(tripData.startDate),
            endDate: new Date(tripData.endDate),
            travelers: tripData.travelers,
            budget: tripData.budget,
            currency: tripData.currency,
            travelStyle: tripData.travelStyle,
            transportPreference: tripData.transportPreference,
            hotelCategory: tripData.hotelCategory,
            foodPreference: tripData.foodPreference,
            coverImage: generatedItinerary.coverImage,
        },
    });
    // 3. Save Trip Days and Activities with enriched data
    const tripDays = await Promise.all(generatedItinerary.days.map((day) => prisma.tripDay.create({
        data: {
            tripId: trip.id,
            dayNumber: day.dayNumber,
            date: new Date(day.date),
            activities: {
                create: day.activities?.map((activity, index) => ({
                    time: activity.time,
                    name: activity.name,
                    description: activity.description,
                    location: activity.location,
                    estimatedCost: activity.estimatedCost,
                    duration: activity.duration,
                    category: activity.category,
                    orderIndex: index,
                    // New enriched fields
                    lat: activity.lat || activity.geoCoordinates?.lat || null,
                    lng: activity.lng || activity.geoCoordinates?.lng || null,
                    rating: activity.rating || null,
                    isHiddenGem: activity.isHiddenGem || false,
                    localTip: activity.localTip || null,
                    bestTimeToVisit: activity.bestTimeToVisit || null,
                    imageUrl: activity.imageUrl || activity.photoUrl || null,
                })) || [],
            },
        },
        include: {
            activities: {
                orderBy: { orderIndex: "asc" },
            },
        },
    })));
    return {
        ...trip,
        days: tripDays,
    };
};
exports.generateTrip = generateTrip;
const getUserTrips = async (userId) => {
    return await prisma.trip.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        include: {
            days: {
                orderBy: { dayNumber: "asc" },
                include: {
                    activities: {
                        orderBy: { orderIndex: "asc" },
                        take: 3, // Just first 3 activities for preview
                    },
                },
            },
        },
    });
};
exports.getUserTrips = getUserTrips;
const getTripById = async (tripId, userId) => {
    const trip = await prisma.trip.findFirst({
        where: { id: tripId, userId },
        include: {
            days: {
                orderBy: { dayNumber: "asc" },
                include: {
                    activities: {
                        orderBy: { orderIndex: "asc" },
                    },
                },
            },
        },
    });
    if (!trip) {
        throw new errorHandler_1.AppError("Trip not found", 404);
    }
    return trip;
};
exports.getTripById = getTripById;
const regenerateTripDay = async (tripId, dayId, preferences, userId) => {
    // Verify trip ownership
    const trip = await prisma.trip.findFirst({
        where: { id: tripId, userId },
        include: {
            days: {
                where: { id: dayId },
                include: { activities: true },
            },
        },
    });
    if (!trip) {
        throw new errorHandler_1.AppError("Trip not found", 404);
    }
    const day = trip.days[0];
    if (!day) {
        throw new errorHandler_1.AppError("Day not found", 404);
    }
    // Generate new activities for this day
    const regenerated = await aiService.regenerateDay(tripId, day.dayNumber, {
        destination: trip.destination,
        budget: trip.budget,
        travelStyle: trip.travelStyle,
        ...preferences,
    });
    // Delete old activities
    await prisma.activity.deleteMany({
        where: { tripDayId: dayId },
    });
    // Create new activities
    const newActivities = await Promise.all(regenerated.activities.map((activity, index) => prisma.activity.create({
        data: {
            tripDayId: dayId,
            time: activity.time,
            name: activity.name,
            description: activity.description,
            location: activity.location,
            estimatedCost: activity.estimatedCost,
            duration: activity.duration,
            category: activity.category,
            orderIndex: index,
            lat: activity.lat || null,
            lng: activity.lng || null,
            rating: activity.rating || null,
            isHiddenGem: activity.isHiddenGem || false,
            localTip: activity.localTip || null,
            bestTimeToVisit: activity.bestTimeToVisit || null,
        },
    })));
    return {
        ...day,
        activities: newActivities,
        theme: regenerated.theme,
    };
};
exports.regenerateTripDay = regenerateTripDay;
const getAlternativeActivity = async (activityId, preferences, userId) => {
    // Find the activity and its trip
    const activity = await prisma.activity.findUnique({
        where: { id: activityId },
        include: {
            tripDay: {
                include: {
                    trip: true,
                },
            },
        },
    });
    if (!activity) {
        throw new errorHandler_1.AppError("Activity not found", 404);
    }
    if (activity.tripDay.trip.userId !== userId) {
        throw new errorHandler_1.AppError("Not authorized", 403);
    }
    const alternatives = await aiService.getAlternativeActivities(activity.name, activity.tripDay.trip.destination);
    return {
        currentActivity: activity.name,
        alternatives,
    };
};
exports.getAlternativeActivity = getAlternativeActivity;
