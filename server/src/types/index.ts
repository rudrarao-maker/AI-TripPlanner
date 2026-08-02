export interface IUser {
  id: string;
  clerkId: string | null;
  email: string;
  name: string;
  avatar: string | null;
  role: string;
  provider: string;
  verified: boolean;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ITrip {
  id: string;
  userId: string;
  title: string;
  origin: string;
  destination: string;
  startDate: Date;
  endDate: Date;
  travelers: number;
  budget: any; // Decimal in Prisma
  currency: string;
  travelStyle: string;
  transportPreference: string;
  hotelCategory: string;
  foodPreference: string;
  status: string;
  coverImage: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface IActivity {
  id: string;
  tripDayId: string;
  time: string | null;
  name: string;
  location: string;
  description: string | null;
  duration: number | null;
  estimatedCost: any; // Decimal
  currency: string;
  category: string;
  imageUrl: string | null;
  lat: number | null;
  lng: number | null;
  rating: number | null;
  isHiddenGem: boolean;
  localTip: string | null;
  bestTimeToVisit: string | null;
  orderIndex: number;
}

export interface IAIResponse {
  title: string;
  coverImage: string;
  days: {
    dayNumber: number;
    date: string;
    theme: string;
    activities: {
      time: string;
      name: string;
      location: string;
      geoCoordinates: {
        lat: number;
        lng: number;
      };
      description: string;
      duration: number;
      estimatedCost: number;
      category: string;
      rating: number;
      isHiddenGem: boolean;
      localTip: string;
      bestTimeToVisit: string;
      imageSearchQuery: string;
    }[];
  }[];
}
