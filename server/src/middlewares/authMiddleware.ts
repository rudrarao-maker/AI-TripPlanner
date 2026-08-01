import { Request, Response, NextFunction } from "express";
import { AppError } from "./errorHandler";
import { PrismaClient } from "@prisma/client";
import { requireAuth } from "@clerk/express";

const prisma = new PrismaClient();

declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

// First verify the Clerk JWT, then hydrate the full user from our DB
export const protect = [requireAuth(), async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const auth = (req as any).auth;
    if (!auth || !auth.userId) {
      if (process.env.NODE_ENV === "development") {
        const dummyUser = await prisma.user.findFirst();
        if (dummyUser) {
          req.user = dummyUser;
          return next();
        }
      }
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
}];

export const restrictTo = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!roles.includes(req.user?.role)) {
      return next(
        new AppError("You do not have permission to perform this action", 403),
      );
    }
    next();
  };
};
