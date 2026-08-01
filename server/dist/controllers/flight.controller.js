"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.searchFlights = void 0;
const flight_service_1 = require("../services/flight.service");
const response_1 = require("../utils/response");
const searchFlights = async (req, res) => {
    try {
        const { origin, destination, departureDate, returnDate, adults, travelClass, } = req.query;
        if (!origin || !destination || !departureDate) {
            return (0, response_1.sendError)(res, 400, "origin, destination, and departureDate are required");
        }
        const query = {
            origin: origin,
            destination: destination,
            departureDate: departureDate,
            returnDate: returnDate,
            adults: adults ? parseInt(adults, 10) : 1,
            travelClass: travelClass || "ECONOMY",
        };
        const flights = await flight_service_1.flightService.searchFlights(query);
        (0, response_1.sendSuccess)(res, 200, flights, "Flights retrieved successfully");
    }
    catch (error) {
        console.error("Flight search error:", error);
        (0, response_1.sendError)(res, 500, "Failed to search flights");
    }
};
exports.searchFlights = searchFlights;
