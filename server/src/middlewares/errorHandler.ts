import { Request, Response, NextFunction } from "express";

export class AppError extends Error {
  statusCode: number;
  isOperational: boolean;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
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
    const message = err.errors.map((e: any) => e.message).join(", ");
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
