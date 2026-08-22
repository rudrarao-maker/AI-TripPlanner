import { PipelineState } from "./types";
import { generateObject } from "ai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { z } from "zod";

const google = createGoogleGenerativeAI({
  apiKey: process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY,
});

const DestinationContextSchema = z.object({
  destinationOverview: z.string(),
  weatherSummary: z.string(),
  seasonalConsiderations: z.string(),
  transportTips: z.string(),
  safetyConsiderations: z.string(),
});

export class DestinationAnalyzer {
  static async analyze(state: PipelineState): Promise<PipelineState> {
    const { destination, startDate, endDate, travelers, travelStyle, interests } = state.preferences;
    
    try {
      let openMeteoForecast = "";
      try {
         // Fetch coordinates
         const geoRes = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(destination)}&count=1&language=en&format=json`);
         const geoData = await geoRes.json();
         if (geoData.results && geoData.results.length > 0) {
           const { latitude, longitude } = geoData.results[0];
           
           // Fetch forecast
           const weatherRes = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&daily=temperature_2m_max,temperature_2m_min,precipitation_probability_max&timezone=auto`);
           const weatherData = await weatherRes.json();
           
           if (weatherData.daily) {
             const maxTemp = weatherData.daily.temperature_2m_max[0];
             const minTemp = weatherData.daily.temperature_2m_min[0];
             const rainProb = weatherData.daily.precipitation_probability_max[0];
             openMeteoForecast = `Real 14-day forecast starting today: Max ${maxTemp}°C, Min ${minTemp}°C, Rain Probability: ${rainProb}%.`;
           }
         }
      } catch (e) {
         console.error("Open-Meteo fetch failed:", e);
      }

      const prompt = `Analyze the travel destination: ${destination} for a trip from ${startDate} to ${endDate}.
      Travelers: ${travelers}. Style: ${travelStyle}. Interests: ${interests?.join(", ")}.
      ${openMeteoForecast ? `Incorporate this real forecast data into the weather summary: ${openMeteoForecast}. Also mention seasonal considerations.` : `Provide a brief overview, likely weather for these dates, seasonal considerations, and local transportation tips.`}`;
      
      const result = await generateObject({
        model: google(process.env.GEMINI_MODEL || "gemini-3.1-pro-preview"),
        schema: DestinationContextSchema,
        prompt,
      });

      return {
        ...state,
        context: result.object,
      };
    } catch (error) {
      console.error("DestinationAnalyzer error:", error);
      state.warnings.push("Failed to generate deep destination context, proceeding with basic context.");
      return state;
    }
  }
}
