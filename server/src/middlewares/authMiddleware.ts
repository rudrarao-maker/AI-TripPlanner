import { Request, Response, NextFunction } from "express";
import { AppError } from "./errorHandler";
import { getAuth } from "@clerk/express";
import prisma from "../utils/prisma";

// Extend Express Request to include typed user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        clerkId: string | null;
        email: string;
        name: string;
        avatar: string | null;
        role: string;
        status: string;
        verified: boolean;
        provider: string;
      };
    }
  }
}

/**
 * Clerk-based authentication middleware.
 * Verifies the Clerk JWT, then hydrates the full user from our DB.
 * No development bypasses — all environments require real authentication.
 */
export const protect = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const auth = getAuth(req);
    if (!auth || !auth.userId) {
      return next(new AppError("Authentication invalid or missing", 401));
    }

    // Try to find by clerkId
    let user = await prisma.user.findUnique({
      where: { clerkId: auth.userId },
    });

    if (!user) {
      // Auto-create user from Clerk claims
      const email =
        auth.claims?.email_addresses?.[0] ||
        auth.claims?.email ||
        `${auth.userId}@clerk.local`;
      const name = auth.claims?.first_name
        ? `${auth.claims.first_name} ${auth.claims.last_name || ""}`.trim()
        : "Traveler";

      user = await prisma.user.create({
        data: {
          clerkId: auth.userId,
          email: email,
          name: name,
          provider: "clerk",
          verified: true,
        },
      });
    }

    if (user.status === "restricted") {
      return next(
        new AppError(
          "Your account has been restricted. Please contact support.",
          403,
        ),
      );
    }

    req.user = user;
    next();
  } catch (error) {
    next(new AppError("Error hydrating user from database.", 500));
  }
};

/**
 * Role-based access control middleware.
 * Must be used AFTER `protect`.
 */
export const restrictTo = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const userRole = req.user?.role?.toLowerCase() || "";
    const allowedRoles = roles.map((r) => r.toLowerCase());

    if (!allowedRoles.includes(userRole)) {
      return next(
        new AppError("You do not have permission to perform this action", 403),
      );
    }
    next();
  };
};

// ============================================================
// Trip Access Authorization Helpers
// ============================================================

/**
 * Verifies the user has ANY access to the trip (owner or member).
 * Returns the trip membership role or throws 403/404.
 */
export const assertTripAccess = async (
  userId: string,
  tripId: string,
): Promise<{ role: string; isOwner: boolean }> => {
  // Check if user is the trip owner
  const trip = await prisma.trip.findUnique({
    where: { id: tripId },
    select: { userId: true },
  });

  if (!trip) {
    throw new AppError("Trip not found", 404);
  }

  if (trip.userId === userId) {
    return { role: "owner", isOwner: true };
  }

  // Check if user is a trip member
  const membership = await prisma.tripMember.findUnique({
    where: {
      tripId_userId: { tripId, userId },
    },
    select: { role: true },
  });

  if (!membership) {
    throw new AppError("You do not have access to this trip", 403);
  }

  return { role: membership.role, isOwner: false };
};

/**
 * Asserts the user is the trip OWNER.
 */
export const assertTripOwner = async (
  userId: string,
  tripId: string,
): Promise<void> => {
  const trip = await prisma.trip.findUnique({
    where: { id: tripId },
    select: { userId: true },
  });

  if (!trip) {
    throw new AppError("Trip not found", 404);
  }

  if (trip.userId !== userId) {
    throw new AppError("Only the trip owner can perform this action", 403);
  }
};

/**
 * Asserts the user can EDIT the trip (owner or editor).
 */
export const assertTripEditor = async (
  userId: string,
  tripId: string,
): Promise<void> => {
  const { role } = await assertTripAccess(userId, tripId);
  if (role === "viewer") {
    throw new AppError("You do not have edit access to this trip", 403);
  }
};
