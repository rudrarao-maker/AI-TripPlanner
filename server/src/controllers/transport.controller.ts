import { Request, Response } from 'express';
import { sendSuccess, sendError } from '../utils/response';
import { transportService, TransportSearchQuery } from '../services/transport.service';

export const searchTransport = async (req: Request, res: Response) => {
  try {
    const { origin, destination, date, type } = req.query;

    if (!origin || !destination || !type) {
      return sendError(res, 400, 'origin, destination, and type are required');
    }

    const query: TransportSearchQuery = {
      origin: origin as string,
      destination: destination as string,
      date: (date as string) || new Date().toISOString().split('T')[0],
      type: type as 'train' | 'bus' | 'cab'
    };

    const results = await transportService.search(query);
    
    sendSuccess(res, 200, results);
  } catch (error) {
    console.error('Failed to search transport:', error);
    sendError(res, 500, 'Failed to search transport');
  }
};
