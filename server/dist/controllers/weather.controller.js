"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getWeather = void 0;
const response_1 = require("../utils/response");
const weather_service_1 = require("../services/weather.service");
const getWeather = async (req, res, next) => {
    try {
        const { lat, lng, location } = req.query;
        if (!lat || !lng) {
            return (0, response_1.sendError)(res, 400, "Latitude (lat) and longitude (lng) are required");
        }
        const latitude = parseFloat(lat);
        const longitude = parseFloat(lng);
        if (isNaN(latitude) || isNaN(longitude)) {
            return (0, response_1.sendError)(res, 400, "Invalid latitude or longitude values");
        }
        if (latitude < -90 ||
            latitude > 90 ||
            longitude < -180 ||
            longitude > 180) {
            return (0, response_1.sendError)(res, 400, "Coordinates out of range");
        }
        const weather = await (0, weather_service_1.getCurrentWeather)(latitude, longitude, location);
        (0, response_1.sendSuccess)(res, 200, weather);
    }
    catch (error) {
        next(error);
    }
};
exports.getWeather = getWeather;
