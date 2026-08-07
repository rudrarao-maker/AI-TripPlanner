import {
  type TravelStyle,
  type TransportPreference,
  type HotelCategory,
  type FoodPreference,
  type ExpenseCategory,
  type Destination,
} from "@/types";

// ============================================================
// Travel Style Options
// ============================================================

export const TRAVEL_STYLES: {
  value: TravelStyle;
  label: string;
  icon: string;
  description: string;
}[] = [
  {
    value: "solo",
    label: "Solo",
    icon: "🎒",
    description: "Explore the world on your own terms",
  },
  {
    value: "family",
    label: "Family",
    icon: "👨‍👩‍👧‍👦",
    description: "Fun-filled trips for the whole family",
  },
  {
    value: "couple",
    label: "Couple",
    icon: "💑",
    description: "Romantic getaways for two",
  },
  {
    value: "honeymoon",
    label: "Honeymoon",
    icon: "💕",
    description: "Celebrate your love in paradise",
  },
  {
    value: "friends",
    label: "Friends",
    icon: "👯",
    description: "Epic adventures with your squad",
  },
  {
    value: "luxury",
    label: "Luxury",
    icon: "👑",
    description: "Premium experiences and five-star comfort",
  },
  {
    value: "budget",
    label: "Budget",
    icon: "💰",
    description: "Maximum fun, minimum spend",
  },
  {
    value: "adventure",
    label: "Adventure",
    icon: "🏔️",
    description: "Thrilling experiences and adrenaline",
  },
  {
    value: "business",
    label: "Business",
    icon: "💼",
    description: "Efficient travel for professionals",
  },
  {
    value: "religious",
    label: "Religious",
    icon: "🕌",
    description: "Spiritual journeys and pilgrimages",
  },
  {
    value: "wildlife",
    label: "Wildlife",
    icon: "🦁",
    description: "Get close to nature and wildlife",
  },
  {
    value: "beach",
    label: "Beach",
    icon: "🏖️",
    description: "Sun, sand, and sea relaxation",
  },
  {
    value: "hill-station",
    label: "Hill Station",
    icon: "⛰️",
    description: "Cool mountain retreats and scenic views",
  },
];

// ============================================================
// Transport Options
// ============================================================

export const TRANSPORT_OPTIONS: {
  value: TransportPreference;
  label: string;
  icon: string;
}[] = [
  { value: "flight", label: "Flight", icon: "✈️" },
  { value: "train", label: "Train", icon: "🚂" },
  { value: "bus", label: "Bus", icon: "🚌" },
  { value: "car", label: "Car / Rental", icon: "🚗" },
  { value: "bike", label: "Bike", icon: "🏍️" },
  { value: "any", label: "Any / Best Option", icon: "🔄" },
];

// ============================================================
// Hotel Categories
// ============================================================

export const HOTEL_CATEGORIES: {
  value: HotelCategory;
  label: string;
  icon: string;
}[] = [
  { value: "1-star", label: "1 Star", icon: "⭐" },
  { value: "2-star", label: "2 Star", icon: "⭐⭐" },
  { value: "3-star", label: "3 Star", icon: "⭐⭐⭐" },
  { value: "4-star", label: "4 Star", icon: "⭐⭐⭐⭐" },
  { value: "5-star", label: "5 Star", icon: "⭐⭐⭐⭐⭐" },
  { value: "hostel", label: "Hostel", icon: "🏠" },
  { value: "resort", label: "Resort", icon: "🏨" },
  { value: "homestay", label: "Homestay", icon: "🏡" },
  { value: "any", label: "Any", icon: "🔄" },
];

// ============================================================
// Food Preferences
// ============================================================

export const FOOD_PREFERENCES: {
  value: FoodPreference;
  label: string;
  icon: string;
}[] = [
  { value: "vegetarian", label: "Vegetarian", icon: "🥬" },
  { value: "non-vegetarian", label: "Non-Vegetarian", icon: "🍖" },
  { value: "vegan", label: "Vegan", icon: "🌱" },
  { value: "jain", label: "Jain", icon: "🥗" },
  { value: "halal", label: "Halal", icon: "🍽️" },
  { value: "any", label: "No Preference", icon: "🔄" },
];

// ============================================================
// Expense Categories
// ============================================================

export const EXPENSE_CATEGORIES: {
  value: ExpenseCategory;
  label: string;
  icon: string;
  color: string;
}[] = [
  { value: "hotel", label: "Hotel", icon: "🏨", color: "#8B5CF6" },
  { value: "food", label: "Food", icon: "🍽️", color: "#F59E0B" },
  { value: "transport", label: "Transport", icon: "🚗", color: "#3B82F6" },
  { value: "shopping", label: "Shopping", icon: "🛍️", color: "#EC4899" },
  {
    value: "entertainment",
    label: "Entertainment",
    icon: "🎭",
    color: "#10B981",
  },
  { value: "others", label: "Others", icon: "📦", color: "#6B7280" },
];

// ============================================================
// Featured Destinations (Mock Data)
// ============================================================

export const FEATURED_DESTINATIONS: Destination[] = [
  {
    id: "1",
    name: "Goa",
    country: "India",
    description:
      "Sun-kissed beaches, vibrant nightlife, and Portuguese heritage make Goa the ultimate beach destination.",
    image: "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=800",
    rating: 4.7,
    category: ["beach", "nightlife", "culture"],
    bestSeason: "November - February",
    averageBudget: 15000,
    currency: "INR",
    coordinates: { lat: 15.2993, lng: 74.124 },
    popular: true,
  },
  {
    id: "2",
    name: "Manali",
    country: "India",
    description:
      "A breathtaking hill station nestled in the Himalayas with adventure sports and serene valleys.",
    image: "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=800",
    rating: 4.6,
    category: ["hill-station", "adventure", "nature"],
    bestSeason: "March - June",
    averageBudget: 12000,
    currency: "INR",
    coordinates: { lat: 32.2396, lng: 77.1887 },
    popular: true,
  },
  {
    id: "3",
    name: "Jaipur",
    country: "India",
    description:
      "The Pink City dazzles with magnificent forts, palaces, and rich Rajasthani culture.",
    image: "https://images.unsplash.com/photo-1599661046289-e31897846e41?w=800",
    rating: 4.5,
    category: ["culture", "history", "architecture"],
    bestSeason: "October - March",
    averageBudget: 10000,
    currency: "INR",
    coordinates: { lat: 26.9124, lng: 75.7873 },
    popular: true,
  },
  {
    id: "4",
    name: "Kerala",
    country: "India",
    description:
      "God's Own Country — lush backwaters, tea plantations, and Ayurvedic wellness retreats.",
    image: "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=800",
    rating: 4.8,
    category: ["nature", "wellness", "backwaters"],
    bestSeason: "September - March",
    averageBudget: 18000,
    currency: "INR",
    coordinates: { lat: 10.8505, lng: 76.2711 },
    popular: true,
  },
  {
    id: "5",
    name: "Ladakh",
    country: "India",
    description:
      "A surreal moonscape with pristine lakes, Buddhist monasteries, and high-altitude passes.",
    image: "https://images.unsplash.com/photo-1626621331169-5f34be280ed9?w=800",
    rating: 4.9,
    category: ["adventure", "nature", "spiritual"],
    bestSeason: "June - September",
    averageBudget: 25000,
    currency: "INR",
    coordinates: { lat: 34.1526, lng: 77.5771 },
    popular: true,
  },
  {
    id: "6",
    name: "Udaipur",
    country: "India",
    description:
      "The City of Lakes — romantic palaces floating on shimmering waters and royal heritage.",
    image: "https://images.unsplash.com/photo-1585128903994-9788298932a4?w=800",
    rating: 4.7,
    category: ["romantic", "culture", "heritage"],
    bestSeason: "September - March",
    averageBudget: 14000,
    currency: "INR",
    coordinates: { lat: 24.5854, lng: 73.7125 },
    popular: true,
  },
  {
    id: "7",
    name: "Bali",
    country: "Indonesia",
    description:
      "Tropical paradise with stunning rice terraces, ancient temples, and world-class surf.",
    image: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800",
    rating: 4.8,
    category: ["beach", "culture", "nature"],
    bestSeason: "April - October",
    averageBudget: 45000,
    currency: "INR",
    coordinates: { lat: -8.409518, lng: 115.188919 },
    popular: true,
  },
  {
    id: "8",
    name: "Paris",
    country: "France",
    description:
      "The City of Light — iconic landmarks, world-class cuisine, and timeless romance.",
    image: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800",
    rating: 4.7,
    category: ["culture", "romantic", "food"],
    bestSeason: "April - June",
    averageBudget: 80000,
    currency: "INR",
    coordinates: { lat: 48.8566, lng: 2.3522 },
    popular: true,
  },
];

// ============================================================
// Things to Do — Activities Data
// ============================================================

export const THINGS_TO_DO = [
  {
    id: "td1",
    title: "Bali Swing & Rice Terrace Tour",
    category: "Adventure",
    image: "https://images.unsplash.com/photo-1537953773345-d172ccf13cf4?w=600",
    rating: 4.9,
    reviews: 2340,
    duration: "6 hours",
    price: 3500,
    location: "Bali, Indonesia",
  },
  {
    id: "td2",
    title: "Himalayan Trek to Triund",
    category: "Hiking",
    image: "https://images.unsplash.com/photo-1551632811-561732d1e306?w=600",
    rating: 4.8,
    reviews: 1890,
    duration: "2 days",
    price: 2500,
    location: "Dharamshala, India",
  },
  {
    id: "td3",
    title: "Snorkeling at Havelock Island",
    category: "Water Sports",
    image: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=600",
    rating: 4.7,
    reviews: 1560,
    duration: "4 hours",
    price: 4000,
    location: "Andaman, India",
  },
  {
    id: "td4",
    title: "Street Food Tour of Old Delhi",
    category: "Food Tours",
    image: "https://images.unsplash.com/photo-1567337710282-00832b415979?w=600",
    rating: 4.9,
    reviews: 3210,
    duration: "3 hours",
    price: 1200,
    location: "Delhi, India",
  },
  {
    id: "td5",
    title: "Safari at Ranthambore",
    category: "Wildlife",
    image: "https://images.unsplash.com/photo-1549366021-9f761d450615?w=600",
    rating: 4.6,
    reviews: 2100,
    duration: "5 hours",
    price: 5500,
    location: "Rajasthan, India",
  },
  {
    id: "td6",
    title: "Louvre Museum Skip-the-Line",
    category: "Museums",
    image: "https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=600",
    rating: 4.8,
    reviews: 8900,
    duration: "3 hours",
    price: 6500,
    location: "Paris, France",
  },
  {
    id: "td7",
    title: "Beach Hopping Goa South",
    category: "Beaches",
    image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600",
    rating: 4.5,
    reviews: 1740,
    duration: "Full day",
    price: 1800,
    location: "Goa, India",
  },
  {
    id: "td8",
    title: "Village Pottery Workshop",
    category: "Local Experiences",
    image: "https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=600",
    rating: 4.7,
    reviews: 890,
    duration: "2 hours",
    price: 800,
    location: "Jaipur, India",
  },
];

// ============================================================
// Trending Destination Sections
// ============================================================

export const TRENDING_SECTIONS = [
  {
    id: "trending",
    title: "🔥 Trending This Month",
    destinations: [
      {
        name: "Rishikesh",
        country: "India",
        image:
          "https://images.unsplash.com/photo-1600100397608-e4b89b984968?w=600",
        rating: 4.8,
        tag: "Adventure",
      },
      {
        name: "Dubai",
        country: "UAE",
        image:
          "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=600",
        rating: 4.7,
        tag: "Luxury",
      },
      {
        name: "Shimla",
        country: "India",
        image:
          "https://images.unsplash.com/photo-1597074866923-dc0589150458?w=600",
        rating: 4.6,
        tag: "Hill Station",
      },
    ],
  },
  {
    id: "weekend",
    title: "🏖️ Top Weekend Getaways",
    destinations: [
      {
        name: "Lonavala",
        country: "India",
        image:
          "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600",
        rating: 4.4,
        tag: "Nature",
      },
      {
        name: "Pondicherry",
        country: "India",
        image:
          "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=600",
        rating: 4.6,
        tag: "Beach",
      },
      {
        name: "Coorg",
        country: "India",
        image:
          "https://images.unsplash.com/photo-1625505826533-5c80aca7d157?w=600",
        rating: 4.7,
        tag: "Nature",
      },
    ],
  },
  {
    id: "family",
    title: "👨‍👩‍👧‍👦 Family Destinations",
    destinations: [
      {
        name: "Ooty",
        country: "India",
        image:
          "https://images.unsplash.com/photo-1585409677983-0f6c41ca9c3b?w=600",
        rating: 4.5,
        tag: "Hill Station",
      },
      {
        name: "Singapore",
        country: "Singapore",
        image:
          "https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=600",
        rating: 4.8,
        tag: "Family",
      },
      {
        name: "Jaisalmer",
        country: "India",
        image:
          "https://images.unsplash.com/photo-1477587458883-47145ed94245?w=600",
        rating: 4.6,
        tag: "Culture",
      },
    ],
  },
  {
    id: "honeymoon",
    title: "💕 Honeymoon Destinations",
    destinations: [
      {
        name: "Maldives",
        country: "Maldives",
        image:
          "https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=600",
        rating: 4.9,
        tag: "Romantic",
      },
      {
        name: "Santorini",
        country: "Greece",
        image:
          "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=600",
        rating: 4.8,
        tag: "Romantic",
      },
      {
        name: "Udaipur",
        country: "India",
        image:
          "https://images.unsplash.com/photo-1585128903994-9788298932a4?w=600",
        rating: 4.7,
        tag: "Heritage",
      },
    ],
  },
  {
    id: "budget",
    title: "💰 Budget-Friendly Trips",
    destinations: [
      {
        name: "Varanasi",
        country: "India",
        image:
          "https://images.unsplash.com/photo-1561361513-2d000a50f0dc?w=600",
        rating: 4.5,
        tag: "Spiritual",
      },
      {
        name: "Hampi",
        country: "India",
        image:
          "https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?w=600",
        rating: 4.7,
        tag: "History",
      },
      {
        name: "Pushkar",
        country: "India",
        image:
          "https://images.unsplash.com/photo-1586611292717-f828b167408c?w=600",
        rating: 4.4,
        tag: "Culture",
      },
    ],
  },
  {
    id: "hidden",
    title: "💎 Hidden Gems",
    destinations: [
      {
        name: "Spiti Valley",
        country: "India",
        image:
          "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=600",
        rating: 4.9,
        tag: "Adventure",
      },
      {
        name: "Ziro Valley",
        country: "India",
        image:
          "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600",
        rating: 4.6,
        tag: "Nature",
      },
      {
        name: "Tirthan Valley",
        country: "India",
        image:
          "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=600",
        rating: 4.8,
        tag: "Hidden",
      },
    ],
  },
];

// ============================================================
// Gallery Images
// ============================================================

export const GALLERY_IMAGES = [
  {
    id: "g1",
    src: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800",
    alt: "Mountain Landscape",
    location: "Swiss Alps",
    height: "tall" as const,
  },
  {
    id: "g2",
    src: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800",
    alt: "Tropical Beach",
    location: "Maldives",
    height: "short" as const,
  },
  {
    id: "g3",
    src: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800",
    alt: "Eiffel Tower",
    location: "Paris",
    height: "medium" as const,
  },
  {
    id: "g4",
    src: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800",
    alt: "Bali Temple",
    location: "Bali",
    height: "tall" as const,
  },
  {
    id: "g5",
    src: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800",
    alt: "Dubai Skyline",
    location: "Dubai",
    height: "short" as const,
  },
  {
    id: "g6",
    src: "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=800",
    alt: "Santorini Sunset",
    location: "Santorini",
    height: "medium" as const,
  },
  {
    id: "g7",
    src: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800",
    alt: "Kyoto Temple",
    location: "Kyoto",
    height: "tall" as const,
  },
  {
    id: "g8",
    src: "https://images.unsplash.com/photo-1516483638261-f4dafaa48cce?w=800",
    alt: "Positano Coast",
    location: "Positano",
    height: "medium" as const,
  },
  {
    id: "g9",
    src: "https://images.unsplash.com/photo-1528127269322-539801943592?w=800",
    alt: "Halong Bay",
    location: "Vietnam",
    height: "short" as const,
  },
  {
    id: "g10",
    src: "https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=800",
    alt: "Overwater Villa",
    location: "Maldives",
    height: "tall" as const,
  },
  {
    id: "g11",
    src: "https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=800",
    alt: "Singapore Gardens",
    location: "Singapore",
    height: "medium" as const,
  },
  {
    id: "g12",
    src: "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=800",
    alt: "Kerala Backwaters",
    location: "Kerala",
    height: "short" as const,
  },
];

// ============================================================
// Blog Categories
// ============================================================

export const BLOG_CATEGORIES = [
  {
    id: "tips",
    label: "Travel Tips",
    icon: "💡",
    color: "bg-amber-500/10 text-amber-600",
  },
  {
    id: "city",
    label: "City Guides",
    icon: "🏙️",
    color: "bg-blue-500/10 text-blue-600",
  },
  {
    id: "packing",
    label: "Packing Guides",
    icon: "🎒",
    color: "bg-green-500/10 text-green-600",
  },
  {
    id: "budget",
    label: "Budget Travel",
    icon: "💰",
    color: "bg-purple-500/10 text-purple-600",
  },
  {
    id: "visa",
    label: "Visa Information",
    icon: "📋",
    color: "bg-red-500/10 text-red-600",
  },
];

export const BLOG_POSTS = [
  {
    id: "b1",
    title: "10 Hidden Gems in Bali You Must Visit",
    date: "Jul 15, 2026",
    category: "tips",
    image: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=600",
    excerpt:
      "Discover the untouched beaches and serene temples away from the tourist crowds.",
    readTime: "5 min",
    author: "Priya S.",
  },
  {
    id: "b2",
    title: "Complete City Guide to Tokyo",
    date: "Jul 10, 2026",
    category: "city",
    image: "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=600",
    excerpt:
      "Everything you need to know before visiting the Japanese capital — from transport to food.",
    readTime: "12 min",
    author: "Rahul M.",
  },
  {
    id: "b3",
    title: "How to Pack for a 2-Week Europe Trip",
    date: "Jul 5, 2026",
    category: "packing",
    image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600",
    excerpt:
      "Fit everything into a carry-on with our expert packing strategies.",
    readTime: "7 min",
    author: "Ananya R.",
  },
  {
    id: "b4",
    title: "Southeast Asia on ₹50,000",
    date: "Jun 28, 2026",
    category: "budget",
    image: "https://images.unsplash.com/photo-1528127269322-539801943592?w=600",
    excerpt:
      "A complete budget breakdown for an unforgettable 10-day trip through Thailand, Vietnam, and Cambodia.",
    readTime: "10 min",
    author: "Arjun K.",
  },
  {
    id: "b5",
    title: "Schengen Visa Guide for Indians",
    date: "Jun 20, 2026",
    category: "visa",
    image: "https://images.unsplash.com/photo-1436491865332-7a61a109db05?w=600",
    excerpt:
      "Step-by-step guide to getting your Schengen visa approved on the first attempt.",
    readTime: "8 min",
    author: "Neha T.",
  },
  {
    id: "b6",
    title: "Ultimate Street Food Tour of Old Delhi",
    date: "Jun 15, 2026",
    category: "tips",
    image: "https://images.unsplash.com/photo-1567337710282-00832b415979?w=600",
    excerpt:
      "Navigate the narrow lanes for the most authentic chaat, kebabs, and parathas.",
    readTime: "6 min",
    author: "Vikram S.",
  },
];

// ============================================================
// Navigation Links
// ============================================================

export const NAV_LINKS = [
  { label: "Home", path: "/" },
  { label: "Destinations", path: "/destinations" },
  { label: "AI Trip Planner", path: "/trip-planner" },
  { label: "Hotels", path: "/hotel-search" },
  { label: "Restaurants", path: "/restaurants" },
];

export const USER_NAV_LINKS = [
  { label: "My Trips", path: "/my-trips", icon: "🗺️" },
  { label: "Wishlist", path: "/wishlist", icon: "❤️" },
  { label: "Settings", path: "/dashboard/security-settings", icon: "⚙️" },
];

// ============================================================
// Pre-Made Itineraries for Destinations
// ============================================================

export const PREMADE_ITINERARIES: Record<string, any[]> = {
  "1": [ // Goa
    {
      id: "goa-budget",
      title: "Backpacker's Goa",
      amount: 8000,
      duration: "3 Days",
      travelStyle: "Budget",
      image: "https://images.unsplash.com/photo-1590082871864-a98293910c5b?w=600",
      description: "Hostels, street food, and beach hopping on a tight budget.",
      tags: ["Budget", "Beaches", "Solo"],
    },
    {
      id: "goa-standard",
      title: "Classic Goa Experience",
      amount: 15000,
      duration: "4 Days",
      travelStyle: "Standard",
      image: "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=600",
      description: "Comfortable resorts, seafood, and famous sightseeing.",
      tags: ["Standard", "Culture", "Relaxation"],
    },
    {
      id: "goa-luxury",
      title: "Luxury Beach Retreat",
      amount: 45000,
      duration: "5 Days",
      travelStyle: "Luxury",
      image: "https://images.unsplash.com/photo-1544256718-3bcf237f3974?w=600",
      description: "5-Star villas, private beach access, and fine dining.",
      tags: ["Luxury", "Romantic", "Premium"],
    },
    {
      id: "goa-party",
      title: "Goa Party Weekend",
      amount: 22000,
      duration: "3 Days",
      travelStyle: "Standard",
      image: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600",
      description: "Hit the best clubs, beach parties, and sundowners.",
      tags: ["Nightlife", "Friends", "Fun"],
    }
  ],
  "2": [ // Manali
    {
      id: "manali-adventure",
      title: "Himalayan Adventure",
      amount: 12000,
      duration: "4 Days",
      travelStyle: "Adventure",
      image: "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=600",
      description: "Trekking, paragliding, and camping under the stars.",
      tags: ["Adventure", "Nature", "Friends"],
    },
    {
      id: "manali-family",
      title: "Family Hill Retreat",
      amount: 25000,
      duration: "5 Days",
      travelStyle: "Family",
      image: "https://images.unsplash.com/photo-1518182170546-076616fdfaaf?w=600",
      description: "Comfortable stays, sightseeing, and snow activities.",
      tags: ["Family", "Relaxation", "Scenic"],
    },
    {
      id: "manali-luxury",
      title: "Luxury Snow Resort",
      amount: 50000,
      duration: "4 Days",
      travelStyle: "Luxury",
      image: "https://images.unsplash.com/photo-1548680197-f0d5718df2c4?w=600",
      description: "Premium chalets, spa treatments, and gourmet dining.",
      tags: ["Luxury", "Romantic", "Winter"],
    }
  ],
  "8": [ // Paris
    {
      id: "paris-budget",
      title: "Paris on a Budget",
      amount: 35000,
      duration: "4 Days",
      travelStyle: "Budget",
      image: "https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=600",
      description: "Affordable stays, walking tours, and street crepes.",
      tags: ["Budget", "Culture", "Walking"],
    },
    {
      id: "paris-romantic",
      title: "Romantic Getaway",
      amount: 80000,
      duration: "5 Days",
      travelStyle: "Luxury",
      image: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=600",
      description: "Seine cruises, Eiffel Tower dining, and boutique hotels.",
      tags: ["Romantic", "Luxury", "Couples"],
    }
  ]
};

// Fallback for destinations not explicitly mapped
export const DEFAULT_PREMADE_ITINERARIES = [
  {
    id: "default-budget",
    title: "Budget Explorer",
    amount: 10000,
    duration: "3 Days",
    travelStyle: "Budget",
    image: "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=600",
    description: "Experience the essentials without breaking the bank.",
    tags: ["Budget", "Essential"],
  },
  {
    id: "default-standard",
    title: "Standard Vacation",
    amount: 25000,
    duration: "4 Days",
    travelStyle: "Standard",
    image: "https://images.unsplash.com/photo-1436491865332-7a61a109db05?w=600",
    description: "The perfect balance of comfort and adventure.",
    tags: ["Standard", "Comfort"],
  },
  {
    id: "default-luxury",
    title: "Luxury Escape",
    amount: 60000,
    duration: "5 Days",
    travelStyle: "Luxury",
    image: "https://images.unsplash.com/photo-1540541338287-41700207dee6?w=600",
    description: "Premium experiences, top-tier stays, and relaxation.",
    tags: ["Luxury", "Premium"],
  }
];

export const DASHBOARD_NAV = [
  { label: "Overview", path: "/dashboard", icon: "LayoutDashboard" },
  { label: "My Trips", path: "/dashboard/trips", icon: "Map" },
  { label: "Bookings", path: "/dashboard/bookings", icon: "Ticket" },
  { label: "Expenses", path: "/dashboard/expenses", icon: "Receipt" },
  { label: "Favorites", path: "/dashboard/favorites", icon: "Heart" },
  { label: "Journal", path: "/dashboard/journal", icon: "BookOpen" },
  { label: "Settings", path: "/dashboard/settings", icon: "Settings" },
];

// ============================================================
// App Configuration
// ============================================================

export const APP_CONFIG = {
  name: "TripCraft AI",
  tagline: "Your AI-Powered Travel Companion",
  description:
    "Plan perfect trips with AI-generated itineraries, smart budgeting, and personalized recommendations.",
  version: "1.0.0",
  currency: "INR",
  currencySymbol: "₹",
};

export const STATS = [
  { label: "Trips Planned (Demo)", value: 50000, suffix: "+" },
  { label: "Happy Travelers (Demo)", value: 120000, suffix: "+" },
  { label: "Destinations (Demo)", value: 500, suffix: "+" },
  { label: "AI Recommendations", value: 1000000, suffix: "+" },
];

export const TESTIMONIALS = [
  {
    name: "Priya Sharma",
    avatar: "",
    role: "Solo Traveler",
    content:
      "TripCraft AI planned my entire Ladakh trip in seconds! The budget breakdown was spot-on and the hotel recommendations were perfect.",
    rating: 5,
  },
  {
    name: "Rahul Mehta",
    avatar: "",
    role: "Family Vacation",
    content:
      "Best trip planning tool I've ever used. The day-by-day itinerary saved us hours of research. My kids loved every attraction it suggested!",
    rating: 5,
  },
  {
    name: "Ananya Reddy",
    avatar: "",
    role: "Honeymoon Trip",
    content:
      "Our honeymoon in Kerala was magical, all thanks to TripCraft AI. The restaurant picks were absolutely divine and within our budget.",
    rating: 5,
  },
];

export const HOW_IT_WORKS = [
  {
    step: 1,
    title: "Tell Us Your Dream",
    description:
      "Enter your destination, dates, budget, and travel style. Our AI understands your unique preferences.",
    icon: "🌍",
  },
  {
    step: 2,
    title: "AI Creates Your Plan",
    description:
      "Our advanced AI generates a complete day-by-day itinerary with hotels, restaurants, and attractions.",
    icon: "🤖",
  },
  {
    step: 3,
    title: "Travel & Enjoy",
    description:
      "Book everything in one place, track expenses, and create memories. Your perfect trip awaits!",
    icon: "✈️",
  },
];
