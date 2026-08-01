"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.bulkDeleteUsers = exports.bulkUpdateUsers = exports.bulkCreateUsers = exports.deleteUser = exports.updateUser = exports.createUser = exports.getAllUsers = exports.updateProfile = exports.getProfile = void 0;
const response_1 = require("../utils/response");
const client_1 = require("@prisma/client");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const errorHandler_1 = require("../middlewares/errorHandler");
const prisma = new client_1.PrismaClient();
const getProfile = async (req, res) => {
    const user = req.user;
    const { password, ...userWithoutPassword } = user;
    (0, response_1.sendSuccess)(res, 200, userWithoutPassword);
};
exports.getProfile = getProfile;
const updateProfile = async (req, res, next) => {
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
        (0, response_1.sendSuccess)(res, 200, userWithoutPassword, "Profile updated successfully");
    }
    catch (error) {
        next(error);
    }
};
exports.updateProfile = updateProfile;
// ============================================================
// Admin Routes
// ============================================================
/**
 * GET /users — Enhanced with search, filter, and pagination
 * Query params: ?search=&role=&status=&page=1&limit=20&sortBy=createdAt&sortOrder=desc
 */
const getAllUsers = async (req, res, next) => {
    try {
        const { search, role, status, page = "1", limit = "50", sortBy = "createdAt", sortOrder = "desc", } = req.query;
        const pageNum = Math.max(1, parseInt(page));
        const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
        const skip = (pageNum - 1) * limitNum;
        // Build where clause for filtering
        const where = {};
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
        const sortField = allowedSortFields.includes(sortBy)
            ? sortBy
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
        (0, response_1.sendSuccess)(res, 200, {
            users,
            pagination: {
                total,
                page: pageNum,
                limit: limitNum,
                totalPages: Math.ceil(total / limitNum),
            },
        }, "Users fetched");
    }
    catch (error) {
        next(error);
    }
};
exports.getAllUsers = getAllUsers;
const createUser = async (req, res, next) => {
    try {
        const { name, email, role, status } = req.body;
        if (!name || !email) {
            return next(new errorHandler_1.AppError("Please provide name and email", 400));
        }
        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            return next(new errorHandler_1.AppError("User with this email already exists", 400));
        }
        // Generate a default password for admin created users
        const salt = await bcryptjs_1.default.genSalt(10);
        const hashedPassword = await bcryptjs_1.default.hash("Password123!", salt);
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
        (0, response_1.sendSuccess)(res, 201, newUser, "User created successfully");
    }
    catch (error) {
        next(error);
    }
};
exports.createUser = createUser;
const updateUser = async (req, res, next) => {
    try {
        const id = req.params.id;
        const { role, status, name, password } = req.body;
        const user = await prisma.user.findUnique({ where: { id } });
        if (!user) {
            return next(new errorHandler_1.AppError("User not found", 404));
        }
        // Prevent changing the last admin's role
        if (user.role === "admin" && role === "user") {
            const adminCount = await prisma.user.count({ where: { role: "admin" } });
            if (adminCount <= 1) {
                return next(new errorHandler_1.AppError("Cannot demote the last admin", 400));
            }
        }
        let hashedPassword = undefined;
        if (password) {
            const salt = await bcryptjs_1.default.genSalt(10);
            hashedPassword = await bcryptjs_1.default.hash(password, salt);
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
        (0, response_1.sendSuccess)(res, 200, updatedUser, "User updated successfully");
    }
    catch (error) {
        next(error);
    }
};
exports.updateUser = updateUser;
const deleteUser = async (req, res, next) => {
    try {
        const id = req.params.id;
        const user = await prisma.user.findUnique({ where: { id } });
        if (!user) {
            return next(new errorHandler_1.AppError("User not found", 404));
        }
        if (user.role === "admin") {
            const adminCount = await prisma.user.count({ where: { role: "admin" } });
            if (adminCount <= 1) {
                return next(new errorHandler_1.AppError("Cannot delete the last admin", 400));
            }
        }
        // Delete user
        await prisma.user.delete({ where: { id } });
        (0, response_1.sendSuccess)(res, 200, null, "User deleted successfully");
    }
    catch (error) {
        next(error);
    }
};
exports.deleteUser = deleteUser;
// ============================================================
// Bulk Operations (Gmail-style multi-user management)
// ============================================================
/**
 * POST /users/bulk — Create multiple users at once
 * Body: { users: [{ name, email, role?, status? }, ...] }
 */
const bulkCreateUsers = async (req, res, next) => {
    try {
        const { users: usersData } = req.body;
        if (!Array.isArray(usersData) || usersData.length === 0) {
            return next(new errorHandler_1.AppError("Please provide an array of users to create", 400));
        }
        if (usersData.length > 50) {
            return next(new errorHandler_1.AppError("Cannot create more than 50 users at once", 400));
        }
        // Validate all emails and check for duplicates
        const emails = usersData.map((u) => u.email?.toLowerCase().trim());
        const uniqueEmails = new Set(emails);
        if (uniqueEmails.size !== emails.length) {
            return next(new errorHandler_1.AppError("Duplicate emails found in the request", 400));
        }
        // Check which emails already exist
        const existingUsers = await prisma.user.findMany({
            where: { email: { in: emails } },
            select: { email: true },
        });
        const existingEmails = new Set(existingUsers.map((u) => u.email));
        // Generate default password hash
        const salt = await bcryptjs_1.default.genSalt(10);
        const hashedPassword = await bcryptjs_1.default.hash("Password123!", salt);
        const results = {
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
            }
            catch (err) {
                results.skipped.push({ email, reason: "Failed to create user" });
            }
        }
        (0, response_1.sendSuccess)(res, 201, results, `${results.created.length} user(s) created, ${results.skipped.length} skipped`);
    }
    catch (error) {
        next(error);
    }
};
exports.bulkCreateUsers = bulkCreateUsers;
/**
 * PUT /users/bulk — Update multiple users at once (role and/or status)
 * Body: { userIds: string[], update: { role?, status? } }
 */
const bulkUpdateUsers = async (req, res, next) => {
    try {
        const { userIds, update } = req.body;
        if (!Array.isArray(userIds) || userIds.length === 0) {
            return next(new errorHandler_1.AppError("Please provide an array of user IDs", 400));
        }
        if (!update || (!update.role && !update.status)) {
            return next(new errorHandler_1.AppError("Please provide at least one field to update (role or status)", 400));
        }
        // If demoting admins, check that we're not demoting all admins
        if (update.role === "user") {
            const adminsBeingDemoted = await prisma.user.count({
                where: { id: { in: userIds }, role: "admin" },
            });
            const totalAdmins = await prisma.user.count({ where: { role: "admin" } });
            const remainingAdmins = totalAdmins - adminsBeingDemoted;
            if (remainingAdmins < 1) {
                return next(new errorHandler_1.AppError("Cannot demote all admins. At least one admin must remain.", 400));
            }
        }
        const data = {};
        if (update.role)
            data.role = update.role;
        if (update.status)
            data.status = update.status;
        const result = await prisma.user.updateMany({
            where: { id: { in: userIds } },
            data,
        });
        (0, response_1.sendSuccess)(res, 200, { count: result.count }, `${result.count} user(s) updated successfully`);
    }
    catch (error) {
        next(error);
    }
};
exports.bulkUpdateUsers = bulkUpdateUsers;
/**
 * DELETE /users/bulk — Delete multiple users at once
 * Body: { userIds: string[] }
 */
const bulkDeleteUsers = async (req, res, next) => {
    try {
        const { userIds } = req.body;
        if (!Array.isArray(userIds) || userIds.length === 0) {
            return next(new errorHandler_1.AppError("Please provide an array of user IDs to delete", 400));
        }
        // Prevent deleting all admins
        const adminsBeingDeleted = await prisma.user.count({
            where: { id: { in: userIds }, role: "admin" },
        });
        const totalAdmins = await prisma.user.count({ where: { role: "admin" } });
        if (totalAdmins - adminsBeingDeleted < 1) {
            return next(new errorHandler_1.AppError("Cannot delete all admins. At least one admin must remain.", 400));
        }
        // Prevent self-deletion
        const currentUserId = req.user?.id;
        if (currentUserId && userIds.includes(currentUserId)) {
            return next(new errorHandler_1.AppError("You cannot delete your own account via bulk operations", 400));
        }
        const result = await prisma.user.deleteMany({
            where: { id: { in: userIds } },
        });
        (0, response_1.sendSuccess)(res, 200, { count: result.count }, `${result.count} user(s) deleted successfully`);
    }
    catch (error) {
        next(error);
    }
};
exports.bulkDeleteUsers = bulkDeleteUsers;
