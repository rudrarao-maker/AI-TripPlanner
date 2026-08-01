"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = exports.AppError = void 0;
class AppError extends Error {
    statusCode;
    isOperational;
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = true;
        Error.captureStackTrace(this, this.constructor);
    }
}
exports.AppError = AppError;
const errorHandler = (err, req, res, next) => {
    let error = { ...err };
    error.message = err.message;
    // Log to console for dev
    console.error(err);
    // Prisma unique constraint error
    if (err.code === "P2002") {
        const message = `Duplicate field value entered`;
        error = new AppError(message, 400);
    }
    // Zod validation error
    if (err.name === "ZodError") {
        const message = err.errors.map((e) => e.message).join(", ");
        error = new AppError(message, 400);
    }
    // JWT errors
    if (err.name === "JsonWebTokenError") {
        const message = "Invalid token. Please log in again!";
        error = new AppError(message, 401);
    }
    if (err.name === "TokenExpiredError") {
        const message = "Your token has expired! Please log in again.";
        error = new AppError(message, 401);
    }
    res.status(error.statusCode || 500).json({
        success: false,
        error: error.message || "Server Error",
        ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
    });
};
exports.errorHandler = errorHandler;
