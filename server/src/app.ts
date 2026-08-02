import express, { Application, Request, Response, NextFunction } from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { errorHandler } from "./middlewares/errorHandler";

// Initialize express app
const app: Application = express();

// Security Middlewares
app.use(helmet());
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  }),
);

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
  standardHeaders: true,
  legacyHeaders: false,
});
app.use("/api", limiter);

import { clerkMiddleware } from "@clerk/express";

// Body parsing Middleware — limit request size
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));

// Clerk Auth Middleware
app.use(clerkMiddleware());

// Health Check Route
app.get("/health", (req: Request, res: Response) => {
  res.status(200).json({ status: "ok", message: "Server is running" });
});

// Base API Route
app.get("/api/v1", (req: Request, res: Response) => {
  res.status(200).json({ message: "Welcome to TripCraft API v1" });
});

import tripRoutes from "./routes/trip.route";
import recRoutes from "./routes/recommendations.route";
import expenseRoutes from "./routes/expense.route";
import bookingRoutes from "./routes/booking.route";
import userRoutes from "./routes/user.route";
import chatRoutes from "./routes/chat.route";
import weatherRoutes from "./routes/weather.route";
import flightRoutes from "./routes/flight.route";
import placesRoutes from "./routes/places.route";
import transportRoutes from "./routes/transport.route";
import adminRoutes from "./routes/admin.route";

import appRoutes from "./routes/app.route";

// Stricter rate limiting for AI-heavy endpoints
const aiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20, // Only 20 AI requests per 15 minutes
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many AI requests. Please try again later." },
});

app.use("/api/v1/trips", aiLimiter, tripRoutes);
app.use("/api/v1/recommendations", recRoutes);
app.use("/api/v1/expenses", expenseRoutes);
app.use("/api/v1/bookings", bookingRoutes);
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/chat", chatRoutes);
app.use("/api/v1/weather", weatherRoutes);
app.use("/api/v1/flights", flightRoutes);
app.use("/api/v1/places", placesRoutes);
app.use("/api/v1/transport", transportRoutes);
app.use("/api/v1/admin", adminRoutes);
app.use("/api/v1/app", appRoutes);

// Handle 404
app.use((req: Request, res: Response, next: NextFunction) => {
  res.status(404).json({
    success: false,
    error: "Route not found",
  });
});

// Global Error Handler
app.use(errorHandler);

export default app;
