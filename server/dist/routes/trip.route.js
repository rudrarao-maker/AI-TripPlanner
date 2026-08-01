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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const tripController = __importStar(require("../controllers/trip.controller"));
const validate_1 = require("../middlewares/validate");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const trip_validation_1 = require("../validations/trip.validation");
const router = (0, express_1.Router)();
// All trip routes require authentication
router.use(authMiddleware_1.protect);
// Limit each IP to 50 AI generations per hour (frontend sends 3 per trip generation)
const generateLimiter = (0, express_rate_limit_1.default)({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 50,
    message: { error: "Too many trips generated from this IP, please try again after an hour. This protects our AI resources." },
    standardHeaders: true,
    legacyHeaders: false,
});
router.post("/parse-prompt", tripController.parsePrompt);
router.post("/generate", (0, validate_1.validate)(trip_validation_1.createTripSchema), generateLimiter, tripController.generate);
router.get("/", tripController.getMyTrips);
router.get("/:id", tripController.getTrip);
router.post("/:id/days/:dayId/regenerate", tripController.regenerateDay);
router.get("/:id/activities/:activityId/alternatives", tripController.getAlternativeActivity);
exports.default = router;
