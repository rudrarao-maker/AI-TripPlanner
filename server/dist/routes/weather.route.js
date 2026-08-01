"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const weather_controller_1 = require("../controllers/weather.controller");
const router = (0, express_1.Router)();
// GET /api/v1/weather?lat=28.6139&lng=77.2090&location=New Delhi
router.get("/", weather_controller_1.getWeather);
exports.default = router;
