import { Request, Response, NextFunction } from 'express';
import { AppError } from './errorHandler';
import { PrismaClient } from '@prisma/client';
import { verifyToken } from '../utils/jwt';

const prisma = new PrismaClient();

declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

export const protect = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies?.accessToken) {
      token = req.cookies.accessToken;
    }

    if (!token) {
      // Fallback for development if no token
      if (process.env.NODE_ENV === 'development') {
         const dummyUser = await prisma.user.findFirst();
         if (dummyUser) {
           req.user = dummyUser;
           return next();
         }
      }
      return next(new AppError('You are not logged in! Please log in to get access.', 401));
    }

    // Verify token
    const decoded: any = verifyToken(token);

    // Check if user still exists
    const currentUser = await prisma.user.findUnique({ 
      where: { id: decoded.id } 
    });
    
    if (!currentUser) {
      return next(new AppError('The user belonging to this token does no longer exist.', 401));
    }

    if (currentUser.status === 'restricted') {
      return next(new AppError('Your account has been restricted. Please contact support.', 403));
    }

    req.user = currentUser;
    next();
  } catch (error) {
    return next(new AppError('Invalid token. Please log in again.', 401));
  }
};

export const restrictTo = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!roles.includes(req.user?.role)) {
      return next(new AppError('You do not have permission to perform this action', 403));
    }
    next();
  };
};
