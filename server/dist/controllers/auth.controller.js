"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.refreshToken = exports.login = exports.register = void 0;
const authService = __importStar(require("../services/auth.service"));
const response_1 = require("../utils/response");
const jwt_1 = require("../utils/jwt");
const errorHandler_1 = require("../middlewares/errorHandler");
const register = async (req, res, next) => {
    try {
        const result = await authService.registerUser(req.body);
        (0, response_1.sendSuccess)(res, 201, result, "User registered successfully");
    }
    catch (error) {
        next(error);
    }
};
exports.register = register;
const login = async (req, res, next) => {
    try {
        const result = await authService.loginUser(req.body);
        (0, response_1.sendSuccess)(res, 200, result, "Login successful");
    }
    catch (error) {
        next(error);
    }
};
exports.login = login;
const refreshToken = async (req, res, next) => {
    try {
        const { refreshToken } = req.body;
        if (!refreshToken) {
            return next(new errorHandler_1.AppError("Refresh token is required", 400));
        }
        const decoded = (0, jwt_1.verifyToken)(refreshToken, true);
        // In a real app, you might want to fetch user role from DB here
        const accessToken = (0, jwt_1.generateAccessToken)(decoded.id, "user");
        (0, response_1.sendSuccess)(res, 200, { accessToken }, "Token refreshed");
    }
    catch (error) {
        next(error);
    }
};
exports.refreshToken = refreshToken;
