import { Request, Response, NextFunction } from 'express';
import { sendSuccess } from '../utils/response';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getHotels = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { location, maxPrice } = req.query;
    
    const where: any = {};
    if (location) where.location = { contains: location as string };
    if (maxPrice) where.pricePerNight = { lte: parseFloat(maxPrice as string) };

    const hotels = await prisma.hotel.findMany({ 
      where,
      take: 10,
      orderBy: { rating: 'desc' }
    });
    
    const formattedHotels = hotels.map(hotel => ({
      ...hotel,
      amenities: JSON.parse(hotel.amenities || '[]'),
      images: JSON.parse(hotel.images || '[]'),
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


