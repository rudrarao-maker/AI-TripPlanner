"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendError = exports.sendSuccess = void 0;
const sendSuccess = (res, statusCode, data, message) => {
    return res.status(statusCode).json({
        success: true,
        data,
        message,
    });
};
exports.sendSuccess = sendSuccess;
const sendError = (res, statusCode, message) => {
    return res.status(statusCode).json({
        success: false,
        error: message,
    });
};
exports.sendError = sendError;
