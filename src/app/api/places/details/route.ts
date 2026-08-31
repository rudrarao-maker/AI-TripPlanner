import { NextResponse } from "next/server";
import { generalApiLimit, applyRateLimit } from "@/lib/apiRateLimit";
import { auth } from "@clerk/nextjs/server";

export async function GET(req: Request) {
  try {
    const { userId } = await auth();
    if (userId) {
      const rateLimitResult = await applyRateLimit(generalApiLimit, userId);
      if (!rateLimitResult.allowed) {
        return NextResponse.json({ error: "Rate limit exceeded" }, { 
          status: 429, 
          headers: rateLimitResult.headers 
        });
      }
    }

    const { searchParams } = new URL(req.url);
    const query = searchParams.get("query");

    if (!query) {
      return NextResponse.json({ error: "Query parameter is required" }, { status: 400 });
    }

    const apiKey = process.env.GOOGLE_PLACES_API_KEY || process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    
    if (!apiKey) {
      return NextResponse.json({ error: "Google Places API key is not configured" }, { status: 500 });
    }

    // 1. Text Search to get place_id
    const searchRes = await fetch(
      `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(query)}&key=${apiKey}`
    );
    
    const searchData = await searchRes.json();
    
    if (!searchData.results || searchData.results.length === 0) {
      return NextResponse.json({ error: "Place not found" }, { status: 404 });
    }

    const place = searchData.results[0];
    const placeId = place.place_id;

    // 2. Details Search to get more info (website, formatted opening hours, etc.)
    const detailsRes = await fetch(
      `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=name,rating,user_ratings_total,formatted_address,formatted_phone_number,website,opening_hours,photos,url,price_level&key=${apiKey}`
    );
    
    const detailsData = await detailsRes.json();
    const details = detailsData.result || {};

    // 3. Format Photos
    let photoUrl = null;
    if (details.photos && details.photos.length > 0) {
      const photoRef = details.photos[0].photo_reference;
      photoUrl = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=${photoRef}&key=${apiKey}`;
    } else if (place.photos && place.photos.length > 0) {
       const photoRef = place.photos[0].photo_reference;
       photoUrl = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=${photoRef}&key=${apiKey}`;
    }

    return NextResponse.json({
      success: true,
      data: {
        placeId: placeId,
        name: details.name || place.name,
        address: details.formatted_address || place.formatted_address,
        rating: details.rating || place.rating,
        userRatingsTotal: details.user_ratings_total || place.user_ratings_total,
        priceLevel: details.price_level,
        photoUrl: photoUrl,
        website: details.website,
        phone: details.formatted_phone_number,
        openNow: details.opening_hours?.open_now ?? place.opening_hours?.open_now,
        weekdayText: details.opening_hours?.weekday_text,
        googleMapsUrl: details.url,
      }
    });

  } catch (error: any) {
    console.error("Google Places API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
