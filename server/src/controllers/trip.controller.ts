import { Request, Response } from "express";
import * as tripService from "../services/trip.service";
import { sendSuccess } from "../utils/response";
import { catchAsync } from "../utils/catchAsync";

export const generate = catchAsync(async (req: Request, res: Response) => {
  const result = await tripService.generateTrip(req.user.id, req.body);
  sendSuccess(res, 201, result, "Trip generated successfully");
});

export const parsePrompt = catchAsync(async (req: Request, res: Response) => {
  const { prompt } = req.body;
  if (!prompt) {
    return res
      .status(400)
      .json({ status: "error", message: "Prompt is required" });
  }
  const parsedData = await tripService.parseUserPrompt(prompt);
  sendSuccess(res, 200, parsedData, "Prompt parsed successfully");
});

export const getMyTrips = catchAsync(async (req: Request, res: Response) => {
  const trips = await tripService.getUserTrips(req.user.id);
  sendSuccess(res, 200, trips);
});

export const getTrip = catchAsync(async (req: Request, res: Response) => {
  const trip = await tripService.getTripById(req.params.id as string, req.user.id);
  sendSuccess(res, 200, trip);
});

export const regenerateDay = catchAsync(async (req: Request, res: Response) => {
  const { dayId, id: tripId } = req.params;
  const { preferences } = req.body;
  const newDay = await tripService.regenerateTripDay(
    tripId as string,
    dayId as string,
    preferences,
    req.user.id,
  );
  sendSuccess(res, 200, newDay, "Day regenerated successfully");
});

export const getAlternativeActivity = catchAsync(async (req: Request, res: Response) => {
  const { activityId } = req.params;
  const { preferences } = req.query;
  const alternative = await tripService.getAlternativeActivity(
    activityId as string,
    preferences,
    req.user.id,
  );
  sendSuccess(res, 200, alternative, "Alternative activity generated successfully");
});
