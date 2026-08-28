import { z } from "zod";
import { generateObject } from "ai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";

const google = createGoogleGenerativeAI({
  apiKey: process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY,
});

export const ReceiptSchema = z.object({
  type: z.enum(["flight", "hotel", "activity", "transport", "other"]).describe("The category of the booking."),
  provider: z.string().describe("The name of the airline, hotel chain, or booking platform (e.g., Delta, Marriott, Expedia)."),
  bookingReference: z.string().optional().describe("The confirmation number or PNR."),
  location: z.string().describe("The primary city, airport code, or address associated with this booking."),
  destination: z.string().optional().describe("If it's a flight, the destination city or airport."),
  startTime: z.string().optional().describe("Check-in date/time or flight departure time. Use ISO format or YYYY-MM-DD HH:mm."),
  endTime: z.string().optional().describe("Check-out date/time or flight arrival time. Use ISO format or YYYY-MM-DD HH:mm."),
  totalCost: z.number().optional().describe("The total price paid. Extract just the number."),
  currency: z.string().optional().describe("The currency code (e.g., USD, INR, EUR)."),
  description: z.string().describe("A brief 1-2 sentence summary of the booking (e.g., 'Flight from JFK to LHR', '3 nights at Marriott').")
});

export type ParsedReceipt = z.infer<typeof ReceiptSchema>;

export async function parseReceiptText(text: string): Promise<ParsedReceipt> {
  const prompt = `
    You are an expert travel assistant. The user has pasted raw text from a booking confirmation email or receipt.
    Your job is to extract the key travel details and structure them.
    
    Raw Receipt Text:
    """
    ${text}
    """
    
    Carefully extract the booking type, provider, reference number, times, and cost. If some information is completely missing, omit it or guess intelligently if it's obvious from context (like inferring it's a hotel if the text mentions "check-out").
  `;

  try {
    const { object } = await generateObject({
      model: google(process.env.GEMINI_MODEL || "gemini-3.1-pro-preview"),
      schema: ReceiptSchema,
      prompt,
    });

    return object;
  } catch (error) {
    console.error("Error parsing receipt with Gemini:", error);
    throw new Error("Failed to parse receipt text. The AI could not understand the format.");
  }
}
