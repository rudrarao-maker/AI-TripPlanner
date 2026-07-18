import { Request, Response, NextFunction } from 'express';
import * as tripService from './trip.service';
import { sendSuccess } from '../../utils/response';

export const generate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await tripService.generateTrip(req.user.id, req.body);
    sendSuccess(res, 201, result, 'Trip generated successfully');
  } catch (error) {
    next(error);
  }
};

export const getMyTrips = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const trips = await tripService.getUserTrips(req.user.id);
    sendSuccess(res, 200, trips);
  } catch (error) {
    next(error);
  }
};

export const getTrip = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const trip = await tripService.getTripById(req.params.id, req.user.id);
    sendSuccess(res, 200, trip);
  } catch (error) {
    next(error);
  }
};
