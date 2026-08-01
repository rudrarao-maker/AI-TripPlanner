"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const errorHandler_1 = require("./middlewares/errorHandler");
// Initialize express app
const app = (0, express_1.default)();
// Security Middlewares
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
}));
// Rate Limiting
const limiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
    standardHeaders: true,
    legacyHeaders: false,
});
app.use("/api", limiter);
const express_2 = require("@clerk/express");
// Body parsing Middleware
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// Clerk Auth Middleware
app.use((0, express_2.clerkMiddleware)());
// Health Check Route
app.get("/health", (req, res) => {
    res.status(200).json({ status: "ok", message: "Server is running" });
});
// Base API Route
app.get("/api/v1", (req, res) => {
    res.status(200).json({ message: "Welcome to TripCraft API v1" });
});
const auth_route_1 = __importDefault(require("./routes/auth.route"));
const trip_route_1 = __importDefault(require("./routes/trip.route"));
const recommendations_route_1 = __importDefault(require("./routes/recommendations.route"));
const expense_route_1 = __importDefault(require("./routes/expense.route"));
const booking_route_1 = __importDefault(require("./routes/booking.route"));
const user_route_1 = __importDefault(require("./routes/user.route"));
const chat_route_1 = __importDefault(require("./routes/chat.route"));
const weather_route_1 = __importDefault(require("./routes/weather.route"));
const flight_route_1 = __importDefault(require("./routes/flight.route"));
const places_route_1 = __importDefault(require("./routes/places.route"));
const transport_route_1 = __importDefault(require("./routes/transport.route"));
const admin_route_1 = __importDefault(require("./routes/admin.route"));
const app_route_1 = __importDefault(require("./routes/app.route"));
app.use("/api/v1/auth", auth_route_1.default);
app.use("/api/v1/trips", trip_route_1.default);
app.use("/api/v1/recommendations", recommendations_route_1.default);
app.use("/api/v1/expenses", expense_route_1.default);
app.use("/api/v1/bookings", booking_route_1.default);
app.use("/api/v1/users", user_route_1.default);
app.use("/api/v1/chat", chat_route_1.default);
app.use("/api/v1/weather", weather_route_1.default);
app.use("/api/v1/flights", flight_route_1.default);
app.use("/api/v1/places", places_route_1.default);
app.use("/api/v1/transport", transport_route_1.default);
app.use("/api/v1/admin", admin_route_1.default);
app.use("/api/v1/app", app_route_1.default);
// Handle 404
app.use((req, res, next) => {
    res.status(404).json({
        success: false,
        error: "Route not found",
    });
});
// Global Error Handler
app.use(errorHandler_1.errorHandler);
exports.default = app;
