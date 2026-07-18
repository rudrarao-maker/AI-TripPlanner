import { type TravelStyle, type TransportPreference, type HotelCategory, type FoodPreference, type ExpenseCategory, type Destination } from '@/types';

// ============================================================
// Travel Style Options
// ============================================================

export const TRAVEL_STYLES: { value: TravelStyle; label: string; icon: string; description: string }[] = [
  { value: 'solo', label: 'Solo', icon: '🎒', description: 'Explore the world on your own terms' },
  { value: 'family', label: 'Family', icon: '👨‍👩‍👧‍👦', description: 'Fun-filled trips for the whole family' },
  { value: 'couple', label: 'Couple', icon: '💑', description: 'Romantic getaways for two' },
  { value: 'honeymoon', label: 'Honeymoon', icon: '💕', description: 'Celebrate your love in paradise' },
  { value: 'friends', label: 'Friends', icon: '👯', description: 'Epic adventures with your squad' },
  { value: 'luxury', label: 'Luxury', icon: '👑', description: 'Premium experiences and five-star comfort' },
  { value: 'budget', label: 'Budget', icon: '💰', description: 'Maximum fun, minimum spend' },
  { value: 'adventure', label: 'Adventure', icon: '🏔️', description: 'Thrilling experiences and adrenaline' },
  { value: 'business', label: 'Business', icon: '💼', description: 'Efficient travel for professionals' },
  { value: 'religious', label: 'Religious', icon: '🕌', description: 'Spiritual journeys and pilgrimages' },
  { value: 'wildlife', label: 'Wildlife', icon: '🦁', description: 'Get close to nature and wildlife' },
  { value: 'beach', label: 'Beach', icon: '🏖️', description: 'Sun, sand, and sea relaxation' },
  { value: 'hill-station', label: 'Hill Station', icon: '⛰️', description: 'Cool mountain retreats and scenic views' },
];

// ============================================================
// Transport Options
// ============================================================

export const TRANSPORT_OPTIONS: { value: TransportPreference; label: string; icon: string }[] = [
  { value: 'flight', label: 'Flight', icon: '✈️' },
  { value: 'train', label: 'Train', icon: '🚂' },
  { value: 'bus', label: 'Bus', icon: '🚌' },
  { value: 'car', label: 'Car / Rental', icon: '🚗' },
  { value: 'bike', label: 'Bike', icon: '🏍️' },
  { value: 'any', label: 'Any / Best Option', icon: '🔄' },
];

// ============================================================
// Hotel Categories
// ============================================================

export const HOTEL_CATEGORIES: { value: HotelCategory; label: string; icon: string }[] = [
  { value: '1-star', label: '1 Star', icon: '⭐' },
  { value: '2-star', label: '2 Star', icon: '⭐⭐' },
  { value: '3-star', label: '3 Star', icon: '⭐⭐⭐' },
  { value: '4-star', label: '4 Star', icon: '⭐⭐⭐⭐' },
  { value: '5-star', label: '5 Star', icon: '⭐⭐⭐⭐⭐' },
  { value: 'hostel', label: 'Hostel', icon: '🏠' },
  { value: 'resort', label: 'Resort', icon: '🏨' },
  { value: 'homestay', label: 'Homestay', icon: '🏡' },
  { value: 'any', label: 'Any', icon: '🔄' },
];

// ============================================================
// Food Preferences
// ============================================================

export const FOOD_PREFERENCES: { value: FoodPreference; label: string; icon: string }[] = [
  { value: 'vegetarian', label: 'Vegetarian', icon: '🥬' },
  { value: 'non-vegetarian', label: 'Non-Vegetarian', icon: '🍖' },
  { value: 'vegan', label: 'Vegan', icon: '🌱' },
  { value: 'jain', label: 'Jain', icon: '🥗' },
  { value: 'halal', label: 'Halal', icon: '🍽️' },
  { value: 'any', label: 'No Preference', icon: '🔄' },
];

// ============================================================
// Expense Categories
// ============================================================

export const EXPENSE_CATEGORIES: { value: ExpenseCategory; label: string; icon: string; color: string }[] = [
  { value: 'hotel', label: 'Hotel', icon: '🏨', color: '#8B5CF6' },
  { value: 'food', label: 'Food', icon: '🍽️', color: '#F59E0B' },
  { value: 'transport', label: 'Transport', icon: '🚗', color: '#3B82F6' },
  { value: 'shopping', label: 'Shopping', icon: '🛍️', color: '#EC4899' },
  { value: 'entertainment', label: 'Entertainment', icon: '🎭', color: '#10B981' },
  { value: 'others', label: 'Others', icon: '📦', color: '#6B7280' },
];

// ============================================================
// Featured Destinations (Mock Data)
// ============================================================

export const FEATURED_DESTINATIONS: Destination[] = [
  {
    id: '1',
    name: 'Goa',
    country: 'India',
    description: 'Sun-kissed beaches, vibrant nightlife, and Portuguese heritage make Goa the ultimate beach destination.',
    image: '/destinations/goa.jpg',
    rating: 4.7,
    category: ['beach', 'nightlife', 'culture'],
    bestSeason: 'November - February',
    averageBudget: 15000,
    currency: 'INR',
    coordinates: { lat: 15.2993, lng: 74.124 },
    popular: true,
  },
  {
    id: '2',
    name: 'Manali',
    country: 'India',
    description: 'A breathtaking hill station nestled in the Himalayas with adventure sports and serene valleys.',
    image: '/destinations/manali.jpg',
    rating: 4.6,
    category: ['hill-station', 'adventure', 'nature'],
    bestSeason: 'March - June',
    averageBudget: 12000,
    currency: 'INR',
    coordinates: { lat: 32.2396, lng: 77.1887 },
    popular: true,
  },
  {
    id: '3',
    name: 'Jaipur',
    country: 'India',
    description: 'The Pink City dazzles with magnificent forts, palaces, and rich Rajasthani culture.',
    image: '/destinations/jaipur.jpg',
    rating: 4.5,
    category: ['culture', 'history', 'architecture'],
    bestSeason: 'October - March',
    averageBudget: 10000,
    currency: 'INR',
    coordinates: { lat: 26.9124, lng: 75.7873 },
    popular: true,
  },
  {
    id: '4',
    name: 'Kerala',
    country: 'India',
    description: 'God\'s Own Country — lush backwaters, tea plantations, and Ayurvedic wellness retreats.',
    image: '/destinations/kerala.jpg',
    rating: 4.8,
    category: ['nature', 'wellness', 'backwaters'],
    bestSeason: 'September - March',
    averageBudget: 18000,
    currency: 'INR',
    coordinates: { lat: 10.8505, lng: 76.2711 },
    popular: true,
  },
  {
    id: '5',
    name: 'Ladakh',
    country: 'India',
    description: 'A surreal moonscape with pristine lakes, Buddhist monasteries, and high-altitude passes.',
    image: '/destinations/ladakh.jpg',
    rating: 4.9,
    category: ['adventure', 'nature', 'spiritual'],
    bestSeason: 'June - September',
    averageBudget: 25000,
    currency: 'INR',
    coordinates: { lat: 34.1526, lng: 77.5771 },
    popular: true,
  },
  {
    id: '6',
    name: 'Udaipur',
    country: 'India',
    description: 'The City of Lakes — romantic palaces floating on shimmering waters and royal heritage.',
    image: '/destinations/udaipur.jpg',
    rating: 4.7,
    category: ['romantic', 'culture', 'heritage'],
    bestSeason: 'September - March',
    averageBudget: 14000,
    currency: 'INR',
    coordinates: { lat: 24.5854, lng: 73.7125 },
    popular: true,
  },
];

// ============================================================
// Navigation Links
// ============================================================

export const NAV_LINKS = [
  { label: 'Home', path: '/' },
  { label: 'Explore', path: '/explore' },
  { label: 'Plan Trip', path: '/plan' },
  { label: 'Expenses', path: '/expenses' },
  { label: 'Journal', path: '/journal' },
  { label: 'Admin', path: '/admin' },
];

export const DASHBOARD_NAV = [
  { label: 'Overview', path: '/dashboard', icon: 'LayoutDashboard' },
  { label: 'My Trips', path: '/dashboard/trips', icon: 'Map' },
  { label: 'Bookings', path: '/dashboard/bookings', icon: 'Ticket' },
  { label: 'Expenses', path: '/dashboard/expenses', icon: 'Receipt' },
  { label: 'Favorites', path: '/dashboard/favorites', icon: 'Heart' },
  { label: 'Journal', path: '/dashboard/journal', icon: 'BookOpen' },
  { label: 'Settings', path: '/dashboard/settings', icon: 'Settings' },
];

// ============================================================
// App Configuration
// ============================================================

export const APP_CONFIG = {
  name: 'TripCraft AI',
  tagline: 'Your AI-Powered Travel Companion',
  description: 'Plan perfect trips with AI-generated itineraries, smart budgeting, and personalized recommendations.',
  version: '1.0.0',
  currency: 'INR',
  currencySymbol: '₹',
};

export const STATS = [
  { label: 'Trips Planned', value: 50000, suffix: '+' },
  { label: 'Happy Travelers', value: 120000, suffix: '+' },
  { label: 'Destinations', value: 500, suffix: '+' },
  { label: 'AI Recommendations', value: 1000000, suffix: '+' },
];

export const TESTIMONIALS = [
  {
    name: 'Priya Sharma',
    avatar: '',
    role: 'Solo Traveler',
    content: 'TripCraft AI planned my entire Ladakh trip in seconds! The budget breakdown was spot-on and the hotel recommendations were perfect.',
    rating: 5,
  },
  {
    name: 'Rahul Mehta',
    avatar: '',
    role: 'Family Vacation',
    content: 'Best trip planning tool I\'ve ever used. The day-by-day itinerary saved us hours of research. My kids loved every attraction it suggested!',
    rating: 5,
  },
  {
    name: 'Ananya Reddy',
    avatar: '',
    role: 'Honeymoon Trip',
    content: 'Our honeymoon in Kerala was magical, all thanks to TripCraft AI. The restaurant picks were absolutely divine and within our budget.',
    rating: 5,
  },
];

export const HOW_IT_WORKS = [
  {
    step: 1,
    title: 'Tell Us Your Dream',
    description: 'Enter your destination, dates, budget, and travel style. Our AI understands your unique preferences.',
    icon: '🌍',
  },
  {
    step: 2,
    title: 'AI Creates Your Plan',
    description: 'Our advanced AI generates a complete day-by-day itinerary with hotels, restaurants, and attractions.',
    icon: '🤖',
  },
  {
    step: 3,
    title: 'Travel & Enjoy',
    description: 'Book everything in one place, track expenses, and create memories. Your perfect trip awaits!',
    icon: '✈️',
  },
];
