"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllBookings = exports.createBooking = exports.getBookings = void 0;
const response_1 = require("../utils/response");
const booking_service_1 = require("../services/booking.service");
const getBookings = async (req, res) => {
    try {
        const userId = req.user?.id;
        const tripId = req.params.tripId;
        if (!userId) {
            return (0, response_1.sendError)(res, 401, "Unauthorized");
        }
        let bookings;
        if (tripId) {
            bookings = await booking_service_1.bookingService.getTripBookings(tripId, userId);
        }
        else {
            bookings = await booking_service_1.bookingService.getUserBookings(userId);
        }
        (0, response_1.sendSuccess)(res, 200, bookings);
    }
    catch (error) {
        console.error("Failed to get bookings:", error);
        (0, response_1.sendError)(res, 500, "Failed to fetch bookings");
    }
};
exports.getBookings = getBookings;
const createBooking = async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return (0, response_1.sendError)(res, 401, "Unauthorized");
        }
        const bookingData = {
            ...req.body,
            userId,
        };
        const newBooking = await booking_service_1.bookingService.createBooking(bookingData);
        (0, response_1.sendSuccess)(res, 201, newBooking, "Booking created successfully");
    }
    catch (error) {
        console.error("Failed to create booking:", error);
        (0, response_1.sendError)(res, 500, "Failed to create booking");
    }
};
exports.createBooking = createBooking;
const getAllBookings = async (req, res) => {
    try {
        const bookings = await booking_service_1.bookingService.getAllBookings();
        (0, response_1.sendSuccess)(res, 200, bookings);
    }
    catch (error) {
        console.error("Failed to get all bookings:", error);
        (0, response_1.sendError)(res, 500, "Failed to fetch all bookings");
    }
};
exports.getAllBookings = getAllBookings;
