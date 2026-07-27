import { Request, Response, NextFunction } from 'express';
import { sendSuccess } from '../utils/response';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { AppError } from '../middlewares/errorHandler';

const prisma = new PrismaClient();

export const getProfile = async (req: Request, res: Response) => {
  const user = req.user;
  const { password, ...userWithoutPassword } = user;
  sendSuccess(res, 200, userWithoutPassword);
};

export const updateProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.user;
    
    // Disallow updating password or sensitive fields here directly
    const { name, avatar } = req.body;
    
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        ...(name && { name }),
        ...(avatar && { avatar }),
      }
    });
    
    const { password, ...userWithoutPassword } = updatedUser;
    sendSuccess(res, 200, userWithoutPassword, 'Profile updated successfully');
  } catch (error) {
    next(error);
  }
};

// Admin routes
export const getAllUsers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        verified: true,
        provider: true,
        createdAt: true,
      }
    });
    sendSuccess(res, 200, users, 'All users fetched');
  } catch (error) {
    next(error);
  }
};

export const createUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, email, role, status } = req.body;
    
    if (!name || !email) {
      return next(new AppError('Please provide name and email', 400));
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return next(new AppError('User with this email already exists', 400));
    }

    // Generate a default password for admin created users
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('Password123!', salt);

    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: role || 'user',
        status: status || 'active',
        verified: true, // admin created user is automatically verified
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        createdAt: true,
      }
    });

    sendSuccess(res, 201, newUser, 'User created successfully');
  } catch (error) {
    next(error);
  }
};

export const updateUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { role, status, name } = req.body;

    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      return next(new AppError('User not found', 404));
    }

    // Prevent changing the last admin's role
    if (user.role === 'admin' && role === 'user') {
      const adminCount = await prisma.user.count({ where: { role: 'admin' } });
      if (adminCount <= 1) {
        return next(new AppError('Cannot demote the last admin', 400));
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        ...(role && { role }),
        ...(status && { status }),
        ...(name && { name }),
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        createdAt: true,
      }
    });

    sendSuccess(res, 200, updatedUser, 'User updated successfully');
  } catch (error) {
    next(error);
  }
};

export const deleteUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      return next(new AppError('User not found', 404));
    }

    if (user.role === 'admin') {
      const adminCount = await prisma.user.count({ where: { role: 'admin' } });
      if (adminCount <= 1) {
        return next(new AppError('Cannot delete the last admin', 400));
      }
    }

    // Delete user
    await prisma.user.delete({ where: { id } });

    sendSuccess(res, 200, null, 'User deleted successfully');
  } catch (error) {
    next(error);
  }
};
