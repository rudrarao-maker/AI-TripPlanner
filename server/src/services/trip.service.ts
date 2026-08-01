import { PrismaClient } from "@prisma/client";
import * as aiService from "./ai.service";
import { AppError } from "../middlewares/errorHandler";

const prisma = new PrismaClient();

export const parseUserPrompt = async (prompt: string) => {
  return await aiService.parseUserPrompt(prompt);
};

export const generateTrip = async (userId: string, tripData: any) => {
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

  // 3. Save Trip Days and Activities
  const tripDays = await Promise.all(
    generatedItinerary.days.map((day: any) =>
      prisma.tripDay.create({
        data: {
          tripId: trip.id,
          dayNumber: day.dayNumber,
          date: new Date(day.date),
          activities: {
            create:
              day.activities?.map((activity: any, index: number) => ({
                time: activity.time,
                name: activity.name,
                description: activity.description,
                location: activity.location,
                estimatedCost: activity.estimatedCost,
                duration: activity.duration,
                category: activity.category,
                orderIndex: index,
              })) || [],
          },
        },
        include: {
          activities: {
            orderBy: { orderIndex: "asc" },
          },
        },
      }),
    ),
  );

  return {
    ...trip,
    days: tripDays,
  };
};

export const getUserTrips = async (userId: string) => {
  return await prisma.trip.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });
};

export const getTripById = async (tripId: string, userId: string) => {
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
    throw new AppError("Trip not found", 404);
  }

  return trip;
};

export const regenerateTripDay = async (
  tripId: string,
  dayId: string,
  preferences: any,
  userId: string,
) => {
  // Logic to call AI service and regenerate day
  return { status: "not_implemented_yet", dayId };
};

export const getAlternativeActivity = async (
  activityId: string,
  preferences: any,
  userId: string,
) => {
  // Logic to call AI service and find alternatives
  return { status: "not_implemented_yet", activityId };
};
