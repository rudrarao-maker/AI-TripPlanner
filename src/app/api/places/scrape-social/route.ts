import { NextRequest, NextResponse } from "next/server";
import { parseSocialUrl } from "@/lib/ai-pipeline/social-parser";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { url } = body;

    if (!url || typeof url !== "string" || !url.startsWith("http")) {
      return NextResponse.json(
        { success: false, error: "Invalid URL provided." },
        { status: 400 }
      );
    }

    // In a real production app, you would use Apify or a headless browser 
    // to scrape the actual video caption. 
    // For this implementation, we will use a simulated mock for demo purposes if it matches a pattern,
    // otherwise we just let Gemini try to parse the URL slug itself.
    
    let mockMetadata = "";
    if (url.includes("best-cafe-in-paris-cafe-de-flore")) {
      mockMetadata = "Caption: Finally made it to Cafe de Flore in Paris! ☕️ The hot chocolate is incredible. #paris #travel #foodie";
    } else if (url.includes("hidden-waterfall-bali")) {
      mockMetadata = "Caption: Found this secret waterfall in Ubud, Bali today! Just a 20 min hike down. Sekumpul Waterfall is stunning. 🌴💧";
    }

    const parsedData = await parseSocialUrl(url, mockMetadata);

    return NextResponse.json({ success: true, data: parsedData });
  } catch (error: any) {
    console.error("Social Scrape API Error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Internal Server Error while scraping social link" },
      { status: 500 }
    );
  }
}
