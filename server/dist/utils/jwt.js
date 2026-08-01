"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyToken = exports.generateRefreshToken = exports.generateAccessToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const generateAccessToken = (userId, role) => {
    return jsonwebtoken_1.default.sign({ id: userId, role }, process.env.JWT_SECRET || "secret", {
        expiresIn: process.env.JWT_EXPIRES_IN || "1d",
    });
};
exports.generateAccessToken = generateAccessToken;
const generateRefreshToken = (userId) => {
    return jsonwebtoken_1.default.sign({ id: userId }, process.env.JWT_REFRESH_SECRET || "refresh_secret", {
        expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "7d",
    });
};
exports.generateRefreshToken = generateRefreshToken;
const verifyToken = (token, isRefresh = false) => {
    const secret = isRefresh
        ? process.env.JWT_REFRESH_SECRET || "refresh_secret"
        : process.env.JWT_SECRET || "secret";
    return jsonwebtoken_1.default.verify(token, secret);
};
exports.verifyToken = verifyToken;
