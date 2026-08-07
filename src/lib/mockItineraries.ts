export interface ItineraryDay {
  day: number;
  title: string;
  activities: {
    time: string;
    title: string;
    description: string;
    imageUrl?: string;
  }[];
}

export interface ReadyMadeItinerary {
  id: string;
  title: string;
  destination: string;
  durationDays: number;
  coverImage: string;
  description: string;
  estimatedCost: string;
  tags: string[];
  days: ItineraryDay[];
}

export const MOCK_ITINERARIES: ReadyMadeItinerary[] = [
  {
    id: "tokyo-7-days",
    title: "The Ultimate Tokyo Experience",
    destination: "Tokyo, Japan",
    durationDays: 7,
    coverImage:
      "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800&q=80",
    description:
      "Dive deep into the neon-lit streets, historic temples, and incredible culinary scene of Tokyo in this comprehensive 7-day adventure.",
    estimatedCost: "₹120,000",
    tags: ["Cultural", "City", "Food"],
    days: [
      {
        day: 1,
        title: "Arrival & Shinjuku Lights",
        activities: [
          {
            time: "14:00",
            title: "Hotel Check-in in Shinjuku",
            description:
              "Settle into your hotel right in the heart of Tokyo’s most vibrant district.",
          },
          {
            time: "19:00",
            title: "Dinner at Omoide Yokocho",
            description:
              "Experience authentic yakitori in this atmospheric, narrow alleyway known as Memory Lane.",
            imageUrl:
              "https://images.unsplash.com/photo-1557409518-691ebcd96038?w=500",
          },
        ],
      },
      {
        day: 2,
        title: "Traditional Asakusa & Skytree",
        activities: [
          {
            time: "09:00",
            title: "Senso-ji Temple",
            description:
              "Visit Tokyo’s oldest and most significant Buddhist temple. Walk through the Kaminarimon gate.",
            imageUrl:
              "https://images.unsplash.com/photo-1590250669222-1db17fcf1ce3?w=500",
          },
          {
            time: "15:00",
            title: "Tokyo Skytree",
            description:
              "Enjoy panoramic views of the sprawling metropolis from one of the tallest structures in the world.",
          },
        ],
      },
    ],
  },
  {
    id: "paris-weekend",
    title: "A Romantic Weekend in Paris",
    destination: "Paris, France",
    durationDays: 3,
    coverImage:
      "https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=800&q=80",
    description:
      "Experience the magic of the City of Light with this curated 3-day weekend itinerary focusing on art, romance, and gastronomy.",
    estimatedCost: "₹85,000",
    tags: ["Romantic", "Art", "Weekend"],
    days: [
      {
        day: 1,
        title: "Icons of Paris",
        activities: [
          {
            time: "10:00",
            title: "Eiffel Tower Tour",
            description:
              "Start your trip with the iconic Eiffel Tower. Don’t forget to take photos from the Trocadéro.",
            imageUrl:
              "https://images.unsplash.com/photo-1511739001486-6bfe10ce785f?w=500",
          },
          {
            time: "20:00",
            title: "Seine River Cruise",
            description:
              "See the city illuminated at night from the comfort of a glass-enclosed boat.",
          },
        ],
      },
      {
        day: 2,
        title: "Louvre & Montmartre",
        activities: [
          {
            time: "09:00",
            title: "The Louvre Museum",
            description:
              "Spend the morning exploring the world’s largest art museum, home to the Mona Lisa.",
            imageUrl:
              "https://images.unsplash.com/photo-1491147334573-44cbb4602074?w=500",
          },
        ],
      },
    ],
  },
  {
    id: "bali-retreat",
    title: "Bali Wellness & Nature Retreat",
    destination: "Bali, Indonesia",
    durationDays: 5,
    coverImage:
      "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800&q=80",
    description:
      "Disconnect and rejuvenate in the lush jungles of Ubud and the pristine beaches of Uluwatu.",
    estimatedCost: "₹65,000",
    tags: ["Nature", "Wellness", "Relaxation"],
    days: [
      {
        day: 1,
        title: "Ubud Jungle Arrival",
        activities: [
          {
            time: "12:00",
            title: "Check-in to Eco Resort",
            description:
              "Arrive at your jungle eco-resort in Ubud and relax by the infinity pool.",
          },
        ],
      },
      {
        day: 2,
        title: "Rice Terraces & Temples",
        activities: [
          {
            time: "08:00",
            title: "Tegallalang Rice Terrace",
            description:
              "Walk through the stunning terraced landscapes in the cool morning air.",
            imageUrl:
              "https://images.unsplash.com/photo-1558980394-a3099ed53bbb?w=500",
          },
          {
            time: "16:00",
            title: "Sacred Monkey Forest",
            description:
              "Explore the nature reserve and Hindu temple complex inhabited by macaques.",
          },
        ],
      },
    ],
  },
];
