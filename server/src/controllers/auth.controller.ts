import { Request, Response, NextFunction } from 'express';
import * as authService from '../services/auth.service';
import { sendSuccess } from '../utils/response';
import { verifyToken, generateAccessToken } from '../utils/jwt';
import { AppError } from '../middlewares/errorHandler';

export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await authService.registerUser(req.body);
    sendSuccess(res, 201, result, 'User registered successfully');
  } catch (error) {
    next(error);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await authService.loginUser(req.body);
    sendSuccess(res, 200, result, 'Login successful');
  } catch (error) {
    next(error);
  }
};

export const refreshToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { refreshToken } = req.body;
    
    if (!refreshToken) {
      return next(new AppError('Refresh token is required', 400));
    }

    const decoded = verifyToken(refreshToken, true) as { id: string };
    
    // In a real app, you might want to fetch user role from DB here
    const accessToken = generateAccessToken(decoded.id, 'user');
    
    sendSuccess(res, 200, { accessToken }, 'Token refreshed');
  } catch (error) {
    next(error);
  }
};


