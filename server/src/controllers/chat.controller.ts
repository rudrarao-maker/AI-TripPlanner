import { Request, Response, NextFunction } from "express";
import { sendSuccess, sendError } from "../utils/response";
import { chatWithContext } from "../services/ai.service";

export const chatWithAI = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { message, tripContext, chatHistory } = req.body;

    if (!message || typeof message !== "string" || !message.trim()) {
      return sendError(res, 400, "Message is required");
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
    const history = (chatHistory || []).map((msg: any) => ({
      role: msg.type === "user" ? "user" : "assistant",
      content: msg.text,
    }));

    const response = await chatWithContext(message.trim(), context, history);

    sendSuccess(res, 200, response);
  } catch (error) {
    next(error);
  }
};
