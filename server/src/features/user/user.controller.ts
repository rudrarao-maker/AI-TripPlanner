import { Request, Response } from 'express';
import { sendSuccess } from '../../utils/response';

export const getProfile = async (req: Request, res: Response) => {
  // Using user attached by protect middleware
  const user = req.user;
  // Remove password
  const { password, ...userWithoutPassword } = user;
  sendSuccess(res, 200, userWithoutPassword);
};

export const updateProfile = async (req: Request, res: Response) => {
  // Mock update
  const user = req.user;
  const updatedUser = { ...user, ...req.body };
  const { password, ...userWithoutPassword } = updatedUser;
  sendSuccess(res, 200, userWithoutPassword, 'Profile updated successfully');
};

export const getAllUsers = async (req: Request, res: Response) => {
  // Mock admin route
  sendSuccess(res, 200, [], 'All users fetched');
};
