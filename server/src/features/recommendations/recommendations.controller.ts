import { Request, Response } from 'express';
import { sendSuccess } from '../../utils/response';

export const getHotels = async (req: Request, res: Response) => {
  // Mock data for Phase 4
  const hotels = [
    {
      id: '1',
      name: 'Taj Lake Palace',
      location: 'Udaipur, India',
      rating: 4.9,
      pricePerNight: 25000,
      amenities: ['Pool', 'Spa', 'Lake View', 'Free Breakfast'],
      images: ['/hotels/taj.jpg']
    },
    {
      id: '2',
      name: 'The Leela',
      location: 'Goa, India',
      rating: 4.8,
      pricePerNight: 18000,
      amenities: ['Beachfront', 'Spa', 'Gym', 'Free WiFi'],
      images: ['/hotels/leela.jpg']
    }
  ];
  sendSuccess(res, 200, hotels);
};

export const getRestaurants = async (req: Request, res: Response) => {
  const restaurants = [
    {
      id: '1',
      name: 'Bukhara',
      cuisine: ['North Indian', 'Mughlai'],
      rating: 4.8,
      priceRange: '$$$$',
      location: 'New Delhi',
    },
    {
      id: '2',
      name: 'Villa Maya',
      cuisine: ['Traditional', 'Seafood'],
      rating: 4.7,
      priceRange: '$$$',
      location: 'Trivandrum',
    }
  ];
  sendSuccess(res, 200, restaurants);
};

export const getAttractions = async (req: Request, res: Response) => {
  const attractions = [
    {
      id: '1',
      name: 'Taj Mahal',
      category: 'Historical',
      location: 'Agra',
      rating: 4.9,
      entryFee: 50,
    }
  ];
  sendSuccess(res, 200, attractions);
};
