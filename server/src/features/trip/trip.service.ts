import { PrismaClient } from '@prisma/client';
import * as aiService from '../ai/ai.service';
import { AppError } from '../../middlewares/errorHandler';

const prisma = new PrismaClient();

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

  // 3. Save Trip Days
  const tripDays = await Promise.all(
    generatedItinerary.days.map((day: any) =>
      prisma.tripDay.create({
        data: {
          tripId: trip.id,
          dayNumber: day.dayNumber,
          date: new Date(day.date),
          morning: JSON.stringify(day.morningActivity),
          afternoon: JSON.stringify(day.afternoonActivity),
          evening: JSON.stringify(day.eveningActivity),
          hotel: JSON.stringify(day.hotel),
        },
      })
    )
  );

  return {
    ...trip,
    days: tripDays,
  };
};

export const getUserTrips = async (userId: string) => {
  return await prisma.trip.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  });
};

export const getTripById = async (tripId: string, userId: string) => {
  const trip = await prisma.trip.findFirst({
    where: { id: tripId, userId },
    include: { days: { orderBy: { dayNumber: 'asc' } } },
  });

  if (!trip) {
    throw new AppError('Trip not found', 404);
  }

  // Parse JSON fields
  const formattedTrip = {
    ...trip,
    days: trip.days.map(day => ({
      ...day,
      morning: day.morning ? JSON.parse(day.morning) : null,
      afternoon: day.afternoon ? JSON.parse(day.afternoon) : null,
      evening: day.evening ? JSON.parse(day.evening) : null,
      hotel: day.hotel ? JSON.parse(day.hotel) : null,
    }))
  };

  return formattedTrip;
};
