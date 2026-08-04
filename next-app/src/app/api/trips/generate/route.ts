import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(req: Request) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const preferences = await req.json();

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro-latest" });
    
    const prompt = `
    You are an expert AI travel agent. Generate a detailed travel itinerary for the following preferences:
    ${JSON.stringify(preferences)}

    You MUST return the response strictly as a JSON object matching this exact schema:
    {
      "title": "A catchy title for the trip",
      "origin": "Origin city",
      "destination": "Destination city",
      "startDate": "YYYY-MM-DD",
      "endDate": "YYYY-MM-DD",
      "budget": 24500,
      "currency": "INR",
      "days": [
        {
          "dayNumber": 1,
          "date": "YYYY-MM-DD",
          "activities": [
            {
              "time": "09:00 AM",
              "name": "Activity name",
              "location": "Location name",
              "description": "Short description",
              "category": "transport|sightseeing|food|hotel",
              "estimatedCost": 500,
              "currency": "INR"
            }
          ]
        }
      ]
    }
    `;

    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: "application/json",
      }
    });

    const response = await result.response;
    const jsonText = response.text();
    const tripData = JSON.parse(jsonText);

    // Save to Supabase
    // 1. Save Trip
    const { data: trip, error: tripError } = await supabase
      .from('Trip')
      .insert({
        userId: user.id,
        title: tripData.title,
        origin: tripData.origin || preferences.origin || "",
        destination: tripData.destination || preferences.destination || "",
        startDate: tripData.startDate || preferences.startDate,
        endDate: tripData.endDate || preferences.endDate,
        budget: tripData.budget || preferences.budget,
        currency: tripData.currency || "INR",
        travelStyle: preferences.travelStyle || "Comfort",
        transportPreference: preferences.transportPreference || "Mixed",
        hotelCategory: preferences.hotelCategory || "Standard",
        foodPreference: preferences.foodPreference || "Any",
        status: "planned"
      })
      .select()
      .single();

    if (tripError) throw new Error("Failed to save trip: " + tripError.message);

    // 2. Save Days and Activities
    for (const day of tripData.days) {
      const { data: tripDay, error: dayError } = await supabase
        .from('TripDay')
        .insert({
          tripId: trip.id,
          dayNumber: day.dayNumber,
          date: day.date || trip.startDate
        })
        .select()
        .single();

      if (dayError) throw new Error("Failed to save day: " + dayError.message);

      if (day.activities && day.activities.length > 0) {
        const activitiesToInsert = day.activities.map((act: any, idx: number) => ({
          tripDayId: tripDay.id,
          time: act.time,
          name: act.name,
          location: act.location,
          description: act.description,
          category: act.category,
          estimatedCost: act.estimatedCost || 0,
          currency: act.currency || "INR",
          orderIndex: idx
        }));

        const { error: actError } = await supabase
          .from('Activity')
          .insert(activitiesToInsert);

        if (actError) throw new Error("Failed to save activities: " + actError.message);
      }
    }

    return NextResponse.json({ success: true, data: { id: trip.id } });
  } catch (error: any) {
    console.error("Trip Generation Error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
