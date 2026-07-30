import { Request, Response, NextFunction } from 'express';
import * as tripService from '../services/trip.service';
import { sendSuccess } from '../utils/response';

export const generate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await tripService.generateTrip(req.user.id, req.body);
    sendSuccess(res, 201, result, 'Trip generated successfully');
  } catch (error) {
    next(error);
  }
};

export const parsePrompt = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { prompt } = req.body;
    if (!prompt) {
      return res.status(400).json({ status: 'error', message: 'Prompt is required' });
    }
    const parsedData = await tripService.parseUserPrompt(prompt);
    sendSuccess(res, 200, parsedData, 'Prompt parsed successfully');
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
    const id = req.params.id as string;
    const trip = await tripService.getTripById(id, req.user.id);
    sendSuccess(res, 200, trip);
  } catch (error) {
    next(error);
  }
};


