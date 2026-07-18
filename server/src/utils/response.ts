import { Response } from 'express';

export const sendSuccess = <T>(
  res: Response,
  statusCode: number,
  data: T,
  message?: string
) => {
  return res.status(statusCode).json({
    success: true,
    data,
    message,
  });
};

export const sendError = (
  res: Response,
  statusCode: number,
  message: string
) => {
  return res.status(statusCode).json({
    success: false,
    error: message,
  });
};
