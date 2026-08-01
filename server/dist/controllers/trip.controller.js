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
exports.getAlternativeActivity = exports.regenerateDay = exports.getTrip = exports.getMyTrips = exports.parsePrompt = exports.generate = void 0;
const tripService = __importStar(require("../services/trip.service"));
const response_1 = require("../utils/response");
const catchAsync_1 = require("../utils/catchAsync");
exports.generate = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const result = await tripService.generateTrip(req.user.id, req.body);
    (0, response_1.sendSuccess)(res, 201, result, "Trip generated successfully");
});
exports.parsePrompt = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const { prompt } = req.body;
    if (!prompt) {
        return res
            .status(400)
            .json({ status: "error", message: "Prompt is required" });
    }
    const parsedData = await tripService.parseUserPrompt(prompt);
    (0, response_1.sendSuccess)(res, 200, parsedData, "Prompt parsed successfully");
});
exports.getMyTrips = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const trips = await tripService.getUserTrips(req.user.id);
    (0, response_1.sendSuccess)(res, 200, trips);
});
exports.getTrip = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const trip = await tripService.getTripById(req.params.id, req.user.id);
    (0, response_1.sendSuccess)(res, 200, trip);
});
exports.regenerateDay = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const { dayId, id: tripId } = req.params;
    const { preferences } = req.body;
    const newDay = await tripService.regenerateTripDay(tripId, dayId, preferences, req.user.id);
    (0, response_1.sendSuccess)(res, 200, newDay, "Day regenerated successfully");
});
exports.getAlternativeActivity = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const { activityId } = req.params;
    const { preferences } = req.query;
    const alternative = await tripService.getAlternativeActivity(activityId, preferences, req.user.id);
    (0, response_1.sendSuccess)(res, 200, alternative, "Alternative activity generated successfully");
});
