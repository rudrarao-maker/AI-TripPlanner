import { Request, Response, NextFunction } from 'express';
import { sendSuccess } from '../utils/response';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

import { hotelService } from '../services/hotel.service';

export const getHotels = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { location, maxPrice } = req.query;
    
    // Convert to unified search params
    const searchParams = {
      destination: (location as string) || 'Goa',
      checkIn: new Date().toISOString().split('T')[0],
      checkOut: new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0],
      guests: 2,
      rooms: 1,
      maxPrice: maxPrice ? parseFloat(maxPrice as string) : undefined
    };

    const hotels = await hotelService.search(searchParams);
    
    // Map to old schema format for frontend compatibility if needed
    // The frontend HotelCard expects certain fields, let's make sure they align.
    const formattedHotels = hotels.map((h, i) => ({
      id: h.id,
      name: h.name,
      location: searchParams.destination,
      description: h.provider,
      pricePerNight: h.price,
      rating: h.rating,
      amenities: h.amenities,
      images: [h.imageUrl || `https://source.unsplash.com/400x300/?hotel,room&sig=${i}`],
      bookingUrl: h.bookingUrl
    }));
    
    sendSuccess(res, 200, formattedHotels);
  } catch (error) {
    next(error);
  }
};

export const getRestaurants = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { location } = req.query;
    
    const where: any = {};
    if (location) where.location = { contains: location as string };

    const restaurants = await prisma.restaurant.findMany({ 
      where,
      take: 10,
      orderBy: { rating: 'desc' }
    });
    
    const formatted = restaurants.map(r => ({
      ...r,
      cuisine: JSON.parse(r.cuisine || '[]'),
      images: JSON.parse(r.images || '[]'),
    }));
    
    sendSuccess(res, 200, formatted);
  } catch (error) {
    next(error);
  }
};

export const getAttractions = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { location } = req.query;
    
    const where: any = {};
    if (location) where.location = { contains: location as string };

    const attractions = await prisma.attraction.findMany({ 
      where,
      take: 10,
      orderBy: { rating: 'desc' } 
    });
    
    const formatted = attractions.map(a => ({
      ...a,
      images: JSON.parse(a.images || '[]'),
    }));
    
    sendSuccess(res, 200, formatted);
  } catch (error) {
    next(error);
  }
};

export const getTransport = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { destination, type } = req.query;
    
    const where: any = {};
    if (destination) where.destination = { contains: destination as string };
    if (type) where.type = type;

    const transport = await prisma.transport.findMany({ 
      where,
      take: 10,
      orderBy: { price: 'asc' }
    });
    
    const formatted = transport.map(t => ({
      ...t,
      images: JSON.parse(t.images || '[]'),
    }));
    
    sendSuccess(res, 200, formatted);
  } catch (error) {
    next(error);
  }
};


