import { Request, Response, NextFunction } from 'express';
import { sendSuccess, sendError } from '../utils/response';
import { getCurrentWeather } from '../services/weather.service';

export const getWeather = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { lat, lng, location } = req.query;

    if (!lat || !lng) {
      return sendError(res, 400, 'Latitude (lat) and longitude (lng) are required');
    }

    const latitude = parseFloat(lat as string);
    const longitude = parseFloat(lng as string);

    if (isNaN(latitude) || isNaN(longitude)) {
      return sendError(res, 400, 'Invalid latitude or longitude values');
    }

    if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
      return sendError(res, 400, 'Coordinates out of range');
    }

    const weather = await getCurrentWeather(latitude, longitude, location as string | undefined);
    sendSuccess(res, 200, weather);
  } catch (error) {
    next(error);
  }
};
