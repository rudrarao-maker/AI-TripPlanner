import prisma from "../utils/prisma";
import * as aiService from "./ai.service";
import { AppError } from "../middlewares/errorHandler";

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

  // 3. Save Trip Days and Activities with enriched data
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
    throw new AppError("Trip not found", 404);
  }

  const day = trip.days[0];
  if (!day) {
    throw new AppError("Day not found", 404);
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
  const newActivities = await Promise.all(
    regenerated.activities.map((activity: any, index: number) =>
      prisma.activity.create({
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
      }),
    ),
  );

  return {
    ...day,
    activities: newActivities,
    theme: regenerated.theme,
  };
};

export const getAlternativeActivity = async (
  activityId: string,
  preferences: any,
  userId: string,
) => {
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
    throw new AppError("Activity not found", 404);
  }

  if (activity.tripDay.trip.userId !== userId) {
    throw new AppError("Not authorized", 403);
  }

  const alternatives = await aiService.getAlternativeActivities(
    activity.name,
    activity.tripDay.trip.destination,
  );

  return {
    currentActivity: activity.name,
    alternatives,
  };
};
