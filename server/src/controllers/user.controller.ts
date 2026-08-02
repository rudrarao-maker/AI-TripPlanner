import { Request, Response, NextFunction } from "express";
import { sendSuccess } from "../utils/response";
import prisma from "../utils/prisma";
import bcrypt from "bcryptjs";
import { AppError } from "../middlewares/errorHandler";

export const getProfile = async (req: Request, res: Response) => {
  const user = req.user;
  const { password, ...userWithoutPassword } = user;
  sendSuccess(res, 200, userWithoutPassword);
};

export const updateProfile = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const user = req.user;

    // Disallow updating password or sensitive fields here directly
    const { name, avatar } = req.body;

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        ...(name && { name }),
        ...(avatar && { avatar }),
      },
    });

    const { password, ...userWithoutPassword } = updatedUser;
    sendSuccess(res, 200, userWithoutPassword, "Profile updated successfully");
  } catch (error) {
    next(error);
  }
};

// ============================================================
// Admin Routes
// ============================================================

/**
 * GET /users — Enhanced with search, filter, and pagination
 * Query params: ?search=&role=&status=&page=1&limit=20&sortBy=createdAt&sortOrder=desc
 */
export const getAllUsers = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const {
      search,
      role,
      status,
      page = "1",
      limit = "50",
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.query;

    const pageNum = Math.max(1, parseInt(page as string));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit as string)));
    const skip = (pageNum - 1) * limitNum;

    // Build where clause for filtering
    const where: any = {};

    if (search && typeof search === "string" && search.trim()) {
      where.OR = [
        { name: { contains: search.trim() } },
        { email: { contains: search.trim() } },
      ];
    }
    if (role && typeof role === "string" && role !== "all") {
      where.role = role;
    }
    if (status && typeof status === "string" && status !== "all") {
      where.status = status;
    }

    // Build orderBy
    const allowedSortFields = ["name", "email", "role", "status", "createdAt"];
    const sortField = allowedSortFields.includes(sortBy as string)
      ? (sortBy as string)
      : "createdAt";
    const order = sortOrder === "asc" ? "asc" : "desc";

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          status: true,
          verified: true,
          provider: true,
          createdAt: true,
        },
        orderBy: { [sortField]: order },
        skip,
        take: limitNum,
      }),
      prisma.user.count({ where }),
    ]);

    sendSuccess(
      res,
      200,
      {
        users,
        pagination: {
          total,
          page: pageNum,
          limit: limitNum,
          totalPages: Math.ceil(total / limitNum),
        },
      },
      "Users fetched",
    );
  } catch (error) {
    next(error);
  }
};

export const createUser = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { name, email, role, status } = req.body;

    if (!name || !email) {
      return next(new AppError("Please provide name and email", 400));
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return next(new AppError("User with this email already exists", 400));
    }

    // Generate a default password for admin created users
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash("Password123!", salt);

    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: role || "user",
        status: status || "active",
        verified: true, // admin created user is automatically verified
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        createdAt: true,
      },
    });

    sendSuccess(res, 201, newUser, "User created successfully");
  } catch (error) {
    next(error);
  }
};

export const updateUser = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const id = req.params.id as string;
    const { role, status, name, password } = req.body;

    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      return next(new AppError("User not found", 404));
    }

    // Prevent changing the last admin's role
    if (user.role === "admin" && role === "user") {
      const adminCount = await prisma.user.count({ where: { role: "admin" } });
      if (adminCount <= 1) {
        return next(new AppError("Cannot demote the last admin", 400));
      }
    }

    let hashedPassword = undefined;
    if (password) {
      const salt = await bcrypt.genSalt(10);
      hashedPassword = await bcrypt.hash(password, salt);
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        ...(role && { role }),
        ...(status && { status }),
        ...(name && { name }),
        ...(hashedPassword && { password: hashedPassword }),
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        createdAt: true,
      },
    });

    sendSuccess(res, 200, updatedUser, "User updated successfully");
  } catch (error) {
    next(error);
  }
};

export const deleteUser = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const id = req.params.id as string;

    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      return next(new AppError("User not found", 404));
    }

    if (user.role === "admin") {
      const adminCount = await prisma.user.count({ where: { role: "admin" } });
      if (adminCount <= 1) {
        return next(new AppError("Cannot delete the last admin", 400));
      }
    }

    // Delete user
    await prisma.user.delete({ where: { id } });

    sendSuccess(res, 200, null, "User deleted successfully");
  } catch (error) {
    next(error);
  }
};

// ============================================================
// Bulk Operations (Gmail-style multi-user management)
// ============================================================

/**
 * POST /users/bulk — Create multiple users at once
 * Body: { users: [{ name, email, role?, status? }, ...] }
 */
export const bulkCreateUsers = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { users: usersData } = req.body;

    if (!Array.isArray(usersData) || usersData.length === 0) {
      return next(
        new AppError("Please provide an array of users to create", 400),
      );
    }

    if (usersData.length > 50) {
      return next(
        new AppError("Cannot create more than 50 users at once", 400),
      );
    }

    // Validate all emails and check for duplicates
    const emails = usersData.map((u: any) => u.email?.toLowerCase().trim());
    const uniqueEmails = new Set(emails);
    if (uniqueEmails.size !== emails.length) {
      return next(new AppError("Duplicate emails found in the request", 400));
    }

    // Check which emails already exist
    const existingUsers = await prisma.user.findMany({
      where: { email: { in: emails } },
      select: { email: true },
    });
    const existingEmails = new Set(existingUsers.map((u) => u.email));

    // Generate default password hash
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash("Password123!", salt);

    const results: {
      created: any[];
      skipped: { email: string; reason: string }[];
    } = {
      created: [],
      skipped: [],
    };

    for (const userData of usersData) {
      const email = userData.email?.toLowerCase().trim();
      const name = userData.name?.trim();

      if (!email || !name) {
        results.skipped.push({
          email: email || "unknown",
          reason: "Missing name or email",
        });
        continue;
      }

      if (existingEmails.has(email)) {
        results.skipped.push({ email, reason: "Email already exists" });
        continue;
      }

      try {
        const newUser = await prisma.user.create({
          data: {
            name,
            email,
            password: hashedPassword,
            role: userData.role || "user",
            status: userData.status || "active",
            verified: true,
          },
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            status: true,
            createdAt: true,
          },
        });
        results.created.push(newUser);
      } catch (err) {
        results.skipped.push({ email, reason: "Failed to create user" });
      }
    }

    sendSuccess(
      res,
      201,
      results,
      `${results.created.length} user(s) created, ${results.skipped.length} skipped`,
    );
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /users/bulk — Update multiple users at once (role and/or status)
 * Body: { userIds: string[], update: { role?, status? } }
 */
export const bulkUpdateUsers = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { userIds, update } = req.body;

    if (!Array.isArray(userIds) || userIds.length === 0) {
      return next(new AppError("Please provide an array of user IDs", 400));
    }

    if (!update || (!update.role && !update.status)) {
      return next(
        new AppError(
          "Please provide at least one field to update (role or status)",
          400,
        ),
      );
    }

    // If demoting admins, check that we're not demoting all admins
    if (update.role === "user") {
      const adminsBeingDemoted = await prisma.user.count({
        where: { id: { in: userIds }, role: "admin" },
      });
      const totalAdmins = await prisma.user.count({ where: { role: "admin" } });
      const remainingAdmins = totalAdmins - adminsBeingDemoted;
      if (remainingAdmins < 1) {
        return next(
          new AppError(
            "Cannot demote all admins. At least one admin must remain.",
            400,
          ),
        );
      }
    }

    const data: any = {};
    if (update.role) data.role = update.role;
    if (update.status) data.status = update.status;

    const result = await prisma.user.updateMany({
      where: { id: { in: userIds } },
      data,
    });

    sendSuccess(
      res,
      200,
      { count: result.count },
      `${result.count} user(s) updated successfully`,
    );
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /users/bulk — Delete multiple users at once
 * Body: { userIds: string[] }
 */
export const bulkDeleteUsers = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { userIds } = req.body;

    if (!Array.isArray(userIds) || userIds.length === 0) {
      return next(
        new AppError("Please provide an array of user IDs to delete", 400),
      );
    }

    // Prevent deleting all admins
    const adminsBeingDeleted = await prisma.user.count({
      where: { id: { in: userIds }, role: "admin" },
    });
    const totalAdmins = await prisma.user.count({ where: { role: "admin" } });
    if (totalAdmins - adminsBeingDeleted < 1) {
      return next(
        new AppError(
          "Cannot delete all admins. At least one admin must remain.",
          400,
        ),
      );
    }

    // Prevent self-deletion
    const currentUserId = req.user?.id;
    if (currentUserId && userIds.includes(currentUserId)) {
      return next(
        new AppError(
          "You cannot delete your own account via bulk operations",
          400,
        ),
      );
    }

    const result = await prisma.user.deleteMany({
      where: { id: { in: userIds } },
    });

    sendSuccess(
      res,
      200,
      { count: result.count },
      `${result.count} user(s) deleted successfully`,
    );
  } catch (error) {
    next(error);
  }
};
