import { Request, Response } from 'express';
import { sendSuccess } from '../utils/response';

export const getBookings = async (req: Request, res: Response) => {
  // Mock data
  const bookings = [
    {
      id: '1',
      tripId: req.params.tripId,
      type: 'hotel',
      status: 'confirmed',
      amount: 25000,
      currency: 'INR',
      details: {
        hotelName: 'Taj Lake Palace',
        checkIn: '2026-08-01',
        checkOut: '2026-08-03'
      }
    }
  ];
  sendSuccess(res, 200, bookings);
};

export const createBooking = async (req: Request, res: Response) => {
  // Mock booking creation
  const newBooking = {
    id: Date.now().toString(),
    status: 'pending',
    ...req.body
  };
  sendSuccess(res, 201, newBooking, 'Booking created successfully');
};


