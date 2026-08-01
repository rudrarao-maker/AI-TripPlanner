"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateTripSchema = exports.createTripSchema = void 0;
const zod_1 = require("zod");
exports.createTripSchema = zod_1.z.object({
    body: zod_1.z.object({
        origin: zod_1.z.string().min(2, "Origin is required"),
        destination: zod_1.z.string().min(2, "Destination is required"),
        startDate: zod_1.z.string().datetime({ message: "Invalid start date" }),
        endDate: zod_1.z.string().datetime({ message: "Invalid end date" }),
        travelers: zod_1.z.number().min(1).default(1),
        budget: zod_1.z.number().min(1, "Budget must be greater than 0"),
        currency: zod_1.z.string().default("INR"),
        travelStyle: zod_1.z.string().default("adventure"),
        transportPreference: zod_1.z.string().default("flight"),
        hotelCategory: zod_1.z.string().default("4-star"),
        foodPreference: zod_1.z.string().default("any"),
        interests: zod_1.z.array(zod_1.z.string()).optional(),
    }),
});
exports.updateTripSchema = zod_1.z.object({
    body: zod_1.z.object({
        title: zod_1.z.string().optional(),
        status: zod_1.z.string().optional(),
        coverImage: zod_1.z.string().optional(),
    }),
});
