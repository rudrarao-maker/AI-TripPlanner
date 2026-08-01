"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTransport = exports.getAttractions = exports.getRestaurants = exports.getHotels = void 0;
const response_1 = require("../utils/response");
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const hotel_service_1 = require("../services/hotel.service");
const getHotels = async (req, res, next) => {
    try {
        const { location, maxPrice } = req.query;
        // Convert to unified search params
        const searchParams = {
            destination: location || "Goa",
            checkIn: new Date().toISOString().split("T")[0],
            checkOut: new Date(Date.now() + 86400000 * 3).toISOString().split("T")[0],
            guests: 2,
            rooms: 1,
            maxPrice: maxPrice ? parseFloat(maxPrice) : undefined,
        };
        const hotels = await hotel_service_1.hotelService.search(searchParams);
        // Map to old schema format for frontend compatibility if needed
        // The frontend HotelCard expects certain fields, let's make sure they align.
        const formattedHotels = hotels.map((h, i) => ({
            id: h.id,
            name: h.name,
            location: searchParams.destination,
            description: h.provider,
            pricePerNight: h.price,
            rating: h.rating,
            amenities: h.amenities,
            images: [
                h.imageUrl ||
                    `https://source.unsplash.com/400x300/?hotel,room&sig=${i}`,
            ],
            bookingUrl: h.bookingUrl,
        }));
        (0, response_1.sendSuccess)(res, 200, formattedHotels);
    }
    catch (error) {
        next(error);
    }
};
exports.getHotels = getHotels;
const getRestaurants = async (req, res, next) => {
    try {
        const { location } = req.query;
        const where = {};
        if (location)
            where.location = { contains: location };
        const restaurants = await prisma.restaurant.findMany({
            where,
            take: 10,
            orderBy: { rating: "desc" },
        });
        const formatted = restaurants.map((r) => ({
            ...r,
            cuisine: JSON.parse(r.cuisine || "[]"),
            images: JSON.parse(r.images || "[]"),
        }));
        (0, response_1.sendSuccess)(res, 200, formatted);
    }
    catch (error) {
        next(error);
    }
};
exports.getRestaurants = getRestaurants;
const getAttractions = async (req, res, next) => {
    try {
        const { location } = req.query;
        const where = {};
        if (location)
            where.location = { contains: location };
        const attractions = await prisma.attraction.findMany({
            where,
            take: 10,
            orderBy: { rating: "desc" },
        });
        const formatted = attractions.map((a) => ({
            ...a,
            images: JSON.parse(a.images || "[]"),
        }));
        (0, response_1.sendSuccess)(res, 200, formatted);
    }
    catch (error) {
        next(error);
    }
};
exports.getAttractions = getAttractions;
const getTransport = async (req, res, next) => {
    try {
        const { destination, type } = req.query;
        const where = {};
        if (destination)
            where.destination = { contains: destination };
        if (type)
            where.type = type;
        const transport = await prisma.transport.findMany({
            where,
            take: 10,
            orderBy: { price: "asc" },
        });
        const formatted = transport.map((t) => ({
            ...t,
            images: JSON.parse(t.images || "[]"),
        }));
        (0, response_1.sendSuccess)(res, 200, formatted);
    }
    catch (error) {
        next(error);
    }
};
exports.getTransport = getTransport;
