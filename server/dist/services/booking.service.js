"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.bookingService = exports.BookingService = void 0;
const client_1 = require("@prisma/client");
const uuid_1 = require("uuid");
const prisma = new client_1.PrismaClient();
class BookingService {
    async createBooking(data) {
        try {
            // Begin transaction to create booking, payment, and specific details
            const booking = await prisma.$transaction(async (tx) => {
                // 1. Create Booking Record
                const newBooking = await tx.booking.create({
                    data: {
                        userId: data.userId,
                        tripId: data.tripId,
                        type: data.type,
                        status: "confirmed", // Assuming direct confirmation for mock/demo
                        totalAmount: data.totalAmount,
                        currency: data.currency || "INR",
                        bookingRef: `REF-${Math.floor(Math.random() * 1000000)}`,
                        provider: data.provider,
                    },
                });
                // 2. Create Payment Record (Simulated)
                await tx.payment.create({
                    data: {
                        bookingId: newBooking.id,
                        amount: data.totalAmount,
                        currency: data.currency || "INR",
                        status: "completed",
                        paymentMethod: "mock_card",
                        transactionId: `TXN-${(0, uuid_1.v4)().split("-")[0].toUpperCase()}`,
                    },
                });
                // 3. Create Specific Details
                if (data.type === "flight" && data.flightDetails) {
                    await tx.flightBooking.create({
                        data: {
                            bookingId: newBooking.id,
                            origin: data.flightDetails.origin,
                            destination: data.flightDetails.destination,
                            departureTime: new Date(data.flightDetails.departureTime),
                            arrivalTime: new Date(data.flightDetails.arrivalTime),
                            airline: data.flightDetails.airline,
                            flightNumber: data.flightDetails.flightNumber,
                            pnr: data.flightDetails.pnr ||
                                `PNR-${Math.floor(Math.random() * 90000) + 10000}`,
                            class: data.flightDetails.class,
                            passengers: data.flightDetails.passengers || 1,
                        },
                    });
                }
                else if (data.type === "hotel" && data.hotelDetails) {
                    await tx.hotelBooking.create({
                        data: {
                            bookingId: newBooking.id,
                            hotelName: data.hotelDetails.hotelName,
                            location: data.hotelDetails.location,
                            checkIn: new Date(data.hotelDetails.checkIn),
                            checkOut: new Date(data.hotelDetails.checkOut),
                            roomType: data.hotelDetails.roomType || "Standard",
                            guests: data.hotelDetails.guests || 2,
                        },
                    });
                }
                return newBooking;
            });
            return await this.getBookingById(booking.id);
        }
        catch (error) {
            console.error("[BookingService] Failed to create booking:", error);
            throw error;
        }
    }
    async getBookingById(id) {
        return prisma.booking.findUnique({
            where: { id },
            include: {
                payment: true,
                flightDetails: true,
                hotelDetails: true,
                trip: {
                    select: { title: true, destination: true },
                },
            },
        });
    }
    async getUserBookings(userId) {
        return prisma.booking.findMany({
            where: { userId },
            include: {
                payment: true,
                flightDetails: true,
                hotelDetails: true,
                trip: {
                    select: { title: true, destination: true },
                },
            },
            orderBy: { createdAt: "desc" },
        });
    }
    async getTripBookings(tripId, userId) {
        return prisma.booking.findMany({
            where: { tripId, userId },
            include: {
                payment: true,
                flightDetails: true,
                hotelDetails: true,
                trip: {
                    select: { title: true, destination: true },
                },
            },
            orderBy: { createdAt: "desc" },
        });
    }
    async getAllBookings() {
        return prisma.booking.findMany({
            include: {
                user: {
                    select: { id: true, name: true, email: true },
                },
                payment: true,
                flightDetails: true,
                hotelDetails: true,
                trip: {
                    select: { title: true, destination: true },
                },
            },
            orderBy: { createdAt: "desc" },
        });
    }
}
exports.BookingService = BookingService;
exports.bookingService = new BookingService();
