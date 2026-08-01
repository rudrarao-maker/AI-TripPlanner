"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.chatWithAI = void 0;
const response_1 = require("../utils/response");
const ai_service_1 = require("../services/ai.service");
const chatWithAI = async (req, res, next) => {
    try {
        const { message, tripContext, chatHistory } = req.body;
        if (!message || typeof message !== "string" || !message.trim()) {
            return (0, response_1.sendError)(res, 400, "Message is required");
        }
        // Build context from request
        const context = {
            tripDestination: tripContext?.destination,
            tripBudget: tripContext?.budget,
            tripCurrency: tripContext?.currency || "INR",
            tripDays: tripContext?.days,
            travelStyle: tripContext?.travelStyle,
            transportPreference: tripContext?.transportPreference,
            hotelCategory: tripContext?.hotelCategory,
            foodPreference: tripContext?.foodPreference,
        };
        // Map chat history to the expected format
        const history = (chatHistory || []).map((msg) => ({
            role: msg.type === "user" ? "user" : "assistant",
            content: msg.text,
        }));
        const response = await (0, ai_service_1.chatWithContext)(message.trim(), context, history);
        (0, response_1.sendSuccess)(res, 200, response);
    }
    catch (error) {
        next(error);
    }
};
exports.chatWithAI = chatWithAI;
