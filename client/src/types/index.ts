// ============================================================
// User & Authentication Types
// ============================================================

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  role: 'user' | 'admin';
  provider: 'email' | 'google';
  verified: boolean;
  phone?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

// ============================================================
// Trip Types
// ============================================================

export type TravelStyle =
  | 'solo'
  | 'family'
  | 'couple'
  | 'honeymoon'
  | 'friends'
  | 'luxury'
  | 'budget'
  | 'adventure'
  | 'business'
  | 'religious'
  | 'wildlife'
  | 'beach'
  | 'hill-station';

export type TransportPreference =
  | 'flight'
  | 'train'
  | 'bus'
  | 'car'
  | 'bike'
  | 'any';

export type HotelCategory =
  | '1-star'
  | '2-star'
  | '3-star'
  | '4-star'
  | '5-star'
  | 'hostel'
  | 'resort'
  | 'homestay'
  | 'any';

export type FoodPreference =
  | 'vegetarian'
  | 'non-vegetarian'
  | 'vegan'
  | 'jain'
  | 'halal'
  | 'any';

export type TripStatus = 'draft' | 'planned' | 'ongoing' | 'completed' | 'cancelled';

export interface TripInput {
  origin: string;
  destination: string;
  startDate: string;
  endDate: string;
  travelers: number;
  budget: number;
  currency: string;
  travelStyle: TravelStyle;
  transportPreference: TransportPreference;
  hotelCategory: HotelCategory;
  foodPreference: FoodPreference;
}

export interface Trip {
  id: string;
  userId: string;
  title: string;
  origin: string;
  destination: string;
  startDate: string;
  endDate: string;
  travelers: number;
  budget: number;
  currency: string;
  travelStyle: TravelStyle;
  transportPreference: TransportPreference;
  hotelCategory: HotelCategory;
  foodPreference: FoodPreference;
  status: TripStatus;
  coverImage?: string;
  days: TripDay[];
  budgetBreakdown: BudgetBreakdown;
  createdAt: string;
  updatedAt: string;
}

export interface TripDay {
  id: string;
  tripId: string;
  dayNumber: number;
  date: string;
  title: string;
  morningActivity: Activity;
  afternoonActivity: Activity;
  eveningActivity: Activity;
  breakfast: RestaurantRecommendation;
  lunch: RestaurantRecommendation;
  dinner: RestaurantRecommendation;
  hotel: HotelRecommendation;
  shopping?: ShoppingSuggestion;
  estimatedCost: number;
  transportToNext?: TransportOption;
  notes?: string;
}

export interface Activity {
  title: string;
  description: string;
  location: string;
  duration: string;
  cost: number;
  type: string;
  rating?: number;
  image?: string;
  coordinates?: Coordinates;
}

export interface ShoppingSuggestion {
  name: string;
  description: string;
  location: string;
  items: string[];
  priceRange: string;
}

// ============================================================
// Hotel Types
// ============================================================

export interface Hotel {
  id: string;
  name: string;
  description: string;
  location: string;
  address: string;
  coordinates: Coordinates;
  rating: number;
  reviewCount: number;
  pricePerNight: number;
  currency: string;
  starRating: number;
  amenities: string[];
  images: string[];
  availability: boolean;
  checkIn: string;
  checkOut: string;
  distance?: string;
}

export interface HotelRecommendation {
  name: string;
  rating: number;
  pricePerNight: number;
  location: string;
  amenities: string[];
  image?: string;
}

// ============================================================
// Restaurant Types
// ============================================================

export interface Restaurant {
  id: string;
  name: string;
  cuisine: string[];
  description: string;
  location: string;
  address: string;
  coordinates: Coordinates;
  rating: number;
  reviewCount: number;
  priceRange: '$' | '$$' | '$$$' | '$$$$';
  dietaryOptions: string[];
  openingHours: string;
  images: string[];
  menu?: string;
  phone?: string;
  distance?: string;
}

export interface RestaurantRecommendation {
  name: string;
  cuisine: string;
  rating: number;
  priceRange: string;
  location: string;
  specialDish?: string;
  image?: string;
}

// ============================================================
// Attraction Types
// ============================================================

export interface Attraction {
  id: string;
  name: string;
  description: string;
  category: string;
  location: string;
  address: string;
  coordinates: Coordinates;
  rating: number;
  reviewCount: number;
  entryFee: number;
  currency: string;
  timings: string;
  duration: string;
  images: string[];
  bestSeason?: string;
  tips?: string[];
}

// ============================================================
// Transportation Types
// ============================================================

export type TransportType = 'flight' | 'train' | 'bus' | 'car' | 'bike' | 'taxi' | 'metro' | 'walking';

export interface TransportOption {
  type: TransportType;
  from: string;
  to: string;
  price: number;
  currency: string;
  duration: string;
  distance: string;
  comfort: 'basic' | 'standard' | 'premium';
  operator?: string;
  departure?: string;
  arrival?: string;
}

// ============================================================
// Budget & Expense Types
// ============================================================

export interface BudgetBreakdown {
  hotel: number;
  transportation: number;
  food: number;
  attractions: number;
  shopping: number;
  miscellaneous: number;
  total: number;
}

export type ExpenseCategory =
  | 'hotel'
  | 'food'
  | 'transport'
  | 'shopping'
  | 'entertainment'
  | 'others';

export interface Expense {
  id: string;
  tripId: string;
  userId: string;
  category: ExpenseCategory;
  amount: number;
  currency: string;
  description: string;
  date: string;
  createdAt: string;
}

// ============================================================
// Booking Types
// ============================================================

export type BookingType = 'hotel' | 'flight' | 'bus' | 'train' | 'car' | 'tour' | 'insurance';
export type BookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed';
export type PaymentMethod = 'razorpay' | 'upi' | 'card' | 'mock';
export type PaymentStatus = 'pending' | 'success' | 'failed' | 'refunded';

export interface Booking {
  id: string;
  userId: string;
  tripId: string;
  type: BookingType;
  status: BookingStatus;
  amount: number;
  currency: string;
  details: Record<string, unknown>;
  createdAt: string;
}

export interface Payment {
  id: string;
  bookingId: string;
  amount: number;
  currency: string;
  method: PaymentMethod;
  status: PaymentStatus;
  transactionId?: string;
  createdAt: string;
}

// ============================================================
// Review Types
// ============================================================

export interface Review {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  targetType: 'hotel' | 'restaurant' | 'attraction';
  targetId: string;
  rating: number;
  comment: string;
  photos: string[];
  createdAt: string;
}

// ============================================================
// Notification Types
// ============================================================

export type NotificationType =
  | 'booking_confirmation'
  | 'trip_reminder'
  | 'weather_alert'
  | 'payment_success'
  | 'price_drop';

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  data?: Record<string, unknown>;
  createdAt: string;
}

// ============================================================
// Packing & Journal Types
// ============================================================

export interface PackingItem {
  id: string;
  tripId: string;
  name: string;
  category: string;
  packed: boolean;
}

export interface JournalEntry {
  id: string;
  tripId: string;
  userId: string;
  title: string;
  content: string;
  photos: string[];
  date: string;
  createdAt: string;
}

// ============================================================
// Chat Types
// ============================================================

export interface ChatMessage {
  id: string;
  userId: string;
  role: 'user' | 'assistant';
  content: string;
  tripId?: string;
  createdAt: string;
}

// ============================================================
// Weather Types
// ============================================================

export interface WeatherData {
  location: string;
  temperature: number;
  feelsLike: number;
  condition: string;
  icon: string;
  humidity: number;
  windSpeed: number;
  uvIndex: number;
  rainChance: number;
  forecast: WeatherForecast[];
}

export interface WeatherForecast {
  date: string;
  tempHigh: number;
  tempLow: number;
  condition: string;
  icon: string;
  rainChance: number;
}

// ============================================================
// Common Types
// ============================================================

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface Destination {
  id: string;
  name: string;
  country: string;
  description: string;
  image: string;
  rating: number;
  category: string[];
  bestSeason: string;
  averageBudget: number;
  currency: string;
  coordinates: Coordinates;
  popular: boolean;
}
