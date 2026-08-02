import { Request, Response } from "express";
import { sendSuccess, sendError } from "../utils/response";
import { catchAsync } from "../utils/catchAsync";
import { assertTripAccess } from "../middlewares/authMiddleware";
import { bookingService } from "../services/booking.service";

/**
 * GET /bookings/:tripId? 
 * If tripId is provided, requires trip membership. Otherwise returns user's bookings.
 */
export const getBookings = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const tripId = req.params.tripId as string;

  let bookings;
  if (tripId) {
    // Verify user has access to this trip
    await assertTripAccess(userId, tripId);
    bookings = await bookingService.getTripBookings(tripId, userId);
  } else {
    bookings = await bookingService.getUserBookings(userId);
  }

  sendSuccess(res, 200, bookings);
});

/**
 * POST /bookings
 * If tripId is provided in body, verify trip access.
 */
export const createBooking = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user!.id;

  // If linking to a trip, verify access
  if (req.body.tripId) {
    await assertTripAccess(userId, req.body.tripId);
  }

  const bookingData = {
    ...req.body,
    userId,
  };

  const newBooking = await bookingService.createBooking(bookingData);
  sendSuccess(res, 201, newBooking, "Booking created successfully (DEMO)");
});

/**
 * GET /bookings/all — Admin only (used via restrictTo middleware on route)
 */
export const getAllBookings = catchAsync(async (req: Request, res: Response) => {
  const bookings = await bookingService.getAllBookings();
  sendSuccess(res, 200, bookings);
});
