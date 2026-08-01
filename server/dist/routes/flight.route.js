"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const flight_controller_1 = require("../controllers/flight.controller");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const router = (0, express_1.Router)();
// Allow public flight search or restrict to logged in users based on requirement
// We'll restrict to logged in users for now
router.use(authMiddleware_1.protect);
router.get("/search", flight_controller_1.searchFlights);
exports.default = router;
