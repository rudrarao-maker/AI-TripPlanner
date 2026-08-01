"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loginUser = exports.registerUser = void 0;
const client_1 = require("@prisma/client");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jwt_1 = require("../utils/jwt");
const errorHandler_1 = require("../middlewares/errorHandler");
const prisma = new client_1.PrismaClient();
const registerUser = async (data) => {
    const { name, email, password } = data;
    // Check if user exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
        throw new errorHandler_1.AppError("Email is already registered", 400);
    }
    // Hash password
    const salt = await bcryptjs_1.default.genSalt(10);
    const hashedPassword = await bcryptjs_1.default.hash(password, salt);
    // Create user
    const user = await prisma.user.create({
        data: {
            name,
            email,
            password: hashedPassword,
        },
    });
    // Generate tokens
    const accessToken = (0, jwt_1.generateAccessToken)(user.id, user.role);
    const refreshToken = (0, jwt_1.generateRefreshToken)(user.id);
    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;
    return {
        user: userWithoutPassword,
        accessToken,
        refreshToken,
    };
};
exports.registerUser = registerUser;
const loginUser = async (data) => {
    const { email, password } = data;
    // Find user
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.password) {
        throw new errorHandler_1.AppError("Invalid email or password", 401);
    }
    // Check password
    const isMatch = await bcryptjs_1.default.compare(password, user.password);
    if (!isMatch) {
        throw new errorHandler_1.AppError("Invalid email or password", 401);
    }
    // Generate tokens
    const accessToken = (0, jwt_1.generateAccessToken)(user.id, user.role);
    const refreshToken = (0, jwt_1.generateRefreshToken)(user.id);
    const { password: _, ...userWithoutPassword } = user;
    return {
        user: userWithoutPassword,
        accessToken,
        refreshToken,
    };
};
exports.loginUser = loginUser;
