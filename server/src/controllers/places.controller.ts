import { Request, Response } from 'express';
import { sendSuccess, sendError } from '../utils/response';
import axios from 'axios';

export const getNearbyPlaces = async (req: Request, res: Response) => {
  try {
    const { lat, lng, type = 'restaurant', radius = 5000 } = req.query;

    if (!lat || !lng) {
      return sendError(res, 400, 'Latitude and longitude are required');
    }

    const GOOGLE_PLACES_API_KEY = process.env.GOOGLE_MAPS_API_KEY;

    if (!GOOGLE_PLACES_API_KEY) {
      console.warn('[Places API] No GOOGLE_MAPS_API_KEY provided. Returning mock data.');
      return sendSuccess(res, 200, [
        { place_id: 'mock1', name: `Mock ${type} 1`, rating: 4.5, user_ratings_total: 120, vicinity: `Near center` },
        { place_id: 'mock2', name: `Mock ${type} 2`, rating: 4.2, user_ratings_total: 85, vicinity: `Downtown` },
        { place_id: 'mock3', name: `Mock ${type} 3`, rating: 4.8, user_ratings_total: 300, vicinity: `Uptown` },
      ]);
    }

    const response = await axios.get('https://maps.googleapis.com/maps/api/place/nearbysearch/json', {
      params: {
        location: `${lat},${lng}`,
        radius,
        type,
        key: GOOGLE_PLACES_API_KEY
      }
    });

    sendSuccess(res, 200, response.data.results);
  } catch (error) {
    console.error('[Places API] Failed to fetch nearby places:', error);
    sendError(res, 500, 'Failed to fetch nearby places');
  }
};
