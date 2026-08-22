import { MultiDestPipelineState, Transfer } from "../types";
import { generateObject } from "ai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { z } from "zod";

const google = createGoogleGenerativeAI({
  apiKey: process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY,
});

const TransferArraySchema = z.object({
  transfers: z.array(z.object({
    from: z.string(),
    to: z.string(),
    mode: z.enum(["flight", "train", "bus", "car", "ferry"]),
    estimatedDurationMinutes: z.number(),
    estimatedCost: z.number(),
    distanceKm: z.number(),
    notes: z.string(),
  })),
});

export class TransportPlanner {
  static async plan(state: MultiDestPipelineState): Promise<MultiDestPipelineState> {
    const { destinationEntries, preferences } = state;
    const transfers: Transfer[] = [];

    if (destinationEntries.length < 2) {
      return { ...state, transfers };
    }

    // Build pairs
    const pairs = [];
    for (let i = 0; i < destinationEntries.length - 1; i++) {
      pairs.push({
        from: destinationEntries[i].name,
        to: destinationEntries[i + 1].name,
      });
    }

    const prompt = `You are a travel logistics expert. For the following inter-city transitions in ${preferences.currency || "INR"} currency, estimate the best transportation option.

User preference: ${preferences.transportPreference || "mixed"}
Budget tier: ${preferences.budgetTier || "moderate"}

Transitions:
${pairs.map((p, i) => `${i + 1}. ${p.from} → ${p.to}`).join("\n")}

For each transition provide:
- Best mode of transport (flight, train, bus, car, ferry)
- Estimated duration in minutes
- Estimated cost in ${preferences.currency || "INR"}
- Approximate distance in km
- A helpful note (e.g. "Book in advance for better fares", "Overnight train available")

IMPORTANT: These are ESTIMATES. Do NOT invent exact schedules or prices. Use reasonable averages.`;

    try {
      const result = await generateObject({
        model: google(process.env.GEMINI_MODEL || "gemini-2.5-flash"),
        schema: TransferArraySchema,
        prompt,
      });

      return {
        ...state,
        transfers: result.object.transfers,
      };
    } catch (error) {
      console.error("TransportPlanner error:", error);
      // Fallback: generate naive estimates
      const fallbackTransfers: Transfer[] = pairs.map(p => ({
        from: p.from,
        to: p.to,
        mode: "train" as const,
        estimatedDurationMinutes: 300,
        estimatedCost: 1500,
        distanceKm: 500,
        notes: "Estimated — verify current schedules before booking.",
      }));

      state.warnings.push("Transport planning used fallback estimates. Please verify.");
      return { ...state, transfers: fallbackTransfers };
    }
  }
}
