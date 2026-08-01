import { Request, Response } from "express";
import { sendSuccess, sendError } from "../utils/response";
import { bookingService } from "../services/booking.service";

export const getBookings = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const tripId = req.params.tripId as string;
    if (!userId) {
      return sendError(res, 401, "Unauthorized");
    }

    let bookings;
    if (tripId) {
      bookings = await bookingService.getTripBookings(tripId, userId);
    } else {
      bookings = await bookingService.getUserBookings(userId);
    }

    sendSuccess(res, 200, bookings);
  } catch (error) {
    console.error("Failed to get bookings:", error);
    sendError(res, 500, "Failed to fetch bookings");
  }
};

export const createBooking = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      return sendError(res, 401, "Unauthorized");
    }

    const bookingData = {
      ...req.body,
      userId,
    };

    const newBooking = await bookingService.createBooking(bookingData);
    sendSuccess(res, 201, newBooking, "Booking created successfully");
  } catch (error) {
    console.error("Failed to create booking:", error);
    sendError(res, 500, "Failed to create booking");
  }
};

export const getAllBookings = async (req: Request, res: Response) => {
  try {
    const bookings = await bookingService.getAllBookings();
    sendSuccess(res, 200, bookings);
  } catch (error) {
    console.error("Failed to get all bookings:", error);
    sendError(res, 500, "Failed to fetch all bookings");
  }
};
