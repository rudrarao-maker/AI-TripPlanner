"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.searchTransport = void 0;
const response_1 = require("../utils/response");
const transport_service_1 = require("../services/transport.service");
const searchTransport = async (req, res) => {
    try {
        const { origin, destination, date, type } = req.query;
        if (!origin || !destination || !type) {
            return (0, response_1.sendError)(res, 400, "origin, destination, and type are required");
        }
        const query = {
            origin: origin,
            destination: destination,
            date: date || new Date().toISOString().split("T")[0],
            type: type,
        };
        const results = await transport_service_1.transportService.search(query);
        (0, response_1.sendSuccess)(res, 200, results);
    }
    catch (error) {
        console.error("Failed to search transport:", error);
        (0, response_1.sendError)(res, 500, "Failed to search transport");
    }
};
exports.searchTransport = searchTransport;
