import axios from 'axios';

/**
 * Service to fetch real-world data from Google Places API
 * This matches the workflow of fetching high-quality photos and exact coordinates for AI-generated itineraries.
 */

const GOOGLE_PLACES_API_KEY = process.env.GOOGLE_PLACES_API_KEY;

export interface PlaceDetails {
  photoUrl: string;
  rating?: number;
  userRatingsTotal?: number;
  formattedAddress?: string;
  lat?: number;
  lng?: number;
}

export const getPlaceDetails = async (placeName: string, locationQuery: string): Promise<PlaceDetails> => {
  // Fallback if no API key is provided
  if (!GOOGLE_PLACES_API_KEY || GOOGLE_PLACES_API_KEY === 'mock_key') {
    return {
      photoUrl: `https://images.unsplash.com/photo-1500835556837-99ac94a94552?auto=format&fit=crop&w=800&q=80`, // Generic travel placeholder
    };
  }

  try {
    // 1. Text Search to find the Place ID
    const searchResponse = await axios.post(
      'https://places.googleapis.com/v1/places:searchText',
      {
        textQuery: `${placeName} in ${locationQuery}`
      },
      {
        headers: {
          'X-Goog-Api-Key': GOOGLE_PLACES_API_KEY,
          'X-Goog-FieldMask': 'places.id,places.rating,places.userRatingCount,places.formattedAddress,places.location,places.photos',
          'Content-Type': 'application/json'
        }
      }
    );

    const place = searchResponse.data.places?.[0];

    if (!place) {
      return { photoUrl: `https://images.unsplash.com/photo-1500835556837-99ac94a94552?auto=format&fit=crop&w=800&q=80` };
    }

    // 2. Construct the Photo URL using the Photo Reference
    let photoUrl = `https://images.unsplash.com/photo-1500835556837-99ac94a94552?auto=format&fit=crop&w=800&q=80`;
    
    if (place.photos && place.photos.length > 0) {
      const photoName = place.photos[0].name; // e.g., "places/ChIJN1t_tDeuEmsRUsoyG83frY4/photos/AUjq9j..."
      photoUrl = `https://places.googleapis.com/v1/${photoName}/media?maxHeightPx=800&maxWidthPx=1200&key=${GOOGLE_PLACES_API_KEY}`;
    }

    return {
      photoUrl,
      rating: place.rating,
      userRatingsTotal: place.userRatingCount,
      formattedAddress: place.formattedAddress,
      lat: place.location?.latitude,
      lng: place.location?.longitude,
    };
  } catch (error) {
    console.error("Error fetching Google Place details:", error);
    // Return fallback on error
    return {
      photoUrl: `https://images.unsplash.com/photo-1500835556837-99ac94a94552?auto=format&fit=crop&w=800&q=80`,
    };
  }
};
