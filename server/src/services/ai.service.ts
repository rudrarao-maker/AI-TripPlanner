import { GoogleGenAI } from "@google/genai";
import { PrismaClient } from "@prisma/client";
import { DESTINATION_DATA } from "../data/destinations";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "mock" });
const prisma = new PrismaClient();

// ============================================================
// Prompt Parsing
// ============================================================

export const parseUserPrompt = async (prompt: string) => {
  const schema = {
    destinations: ["string"],
    travelers: "number",
    daysCount: "number",
    budget: "number (optional)",
    currency: "string (e.g., INR, USD)",
    dates: "string (e.g., December, next week, or specific dates)",
    travelStyle: "string (e.g., adventure, relaxation, honeymoon, family)",
    hotelCategory: "string (e.g., luxury, 4-star, budget)",
  };

  const sysPrompt = `Extract travel parameters from the following user prompt. Return ONLY valid JSON matching this schema: ${JSON.stringify(schema)}. If a parameter is not mentioned, make a reasonable guess or leave it empty.
  
  User Prompt: "${prompt}"`;

  if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== "mock_key") {
    const startTime = Date.now();
    try {
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: sysPrompt,
      });

      let text = response.text || "";
      text = text
        .replace(/```json\n?/g, "")
        .replace(/\n?```/g, "")
        .trim();
      const result = JSON.parse(text);

      await prisma.aiUsageLog.create({
        data: {
          prompt: `Parse Prompt: ${prompt.substring(0, 50)}...`,
          latencyMs: Date.now() - startTime,
          tokens: text.length / 4, // Rough estimation
          status: "success",
        },
      });

      return result;
    } catch (e) {
      console.error("Failed to parse prompt with AI, using fallback:", e);
      await prisma.aiUsageLog.create({
        data: {
          prompt: `Parse Prompt: ${prompt.substring(0, 50)}...`,
          latencyMs: Date.now() - startTime,
          tokens: 0,
          status: "failed",
        },
      });
    }
  }

  // Very basic regex fallback if no API key
  const destMatch = prompt.match(/to\s+([A-Z][a-z]+(\s+[A-Z][a-z]+)*)/);
  const budgetMatch = prompt.match(
    /(?:for|budget)\s*(?:\$|₹|INR|USD)?\s*(\d+(?:,\d+)*)/,
  );
  const travelersMatch = prompt.match(/(two|three|four|five|\d+)\s+people/);

  const daysMatch = prompt.match(/(\d+)(?:\s*-?\s*day)/i);

  const wordToNum: Record<string, number> = {
    two: 2,
    three: 3,
    four: 4,
    five: 5,
  };

  const result = {
    destinations: destMatch ? [destMatch[1]] : ["Goa"],
    travelers: travelersMatch
      ? wordToNum[travelersMatch[1].toLowerCase()] ||
        parseInt(travelersMatch[1])
      : 2,
    daysCount: daysMatch ? parseInt(daysMatch[1]) : 7,
    budget: budgetMatch ? parseInt(budgetMatch[1].replace(/,/g, "")) : 50000,
    currency: prompt.includes("$") ? "USD" : "INR",
    dates: "next month",
    travelStyle: prompt.toLowerCase().includes("honeymoon")
      ? "honeymoon"
      : "adventure",
    hotelCategory: prompt.toLowerCase().includes("luxury")
      ? "luxury"
      : "4-star",
  };

  await prisma.aiUsageLog.create({
    data: {
      prompt: `[MOCK] Parse Prompt: ${prompt.substring(0, 50)}...`,
      latencyMs: Math.floor(Math.random() * 300) + 100, // mock latency
      tokens: 0,
      status: "success",
    },
  });

  return result;
};

// ============================================================
// GPS Coordinate Database for Popular Destinations
// ============================================================

interface PlaceCoord {
  name: string;
  lat: number;
  lng: number;
  category: string;
  rating: number;
  bestTime: string;
  tip: string;
}

const PLACE_COORDS: Record<string, PlaceCoord[]> = {
  goa: [
    { name: "Baga Beach", lat: 15.5559, lng: 73.7514, category: "beach", rating: 4.5, bestTime: "Morning or Sunset", tip: "Arrive before 7 AM for a peaceful experience. The northern end is less crowded." },
    { name: "Fort Aguada", lat: 15.4928, lng: 73.7736, category: "museum", rating: 4.3, bestTime: "Early morning", tip: "The lighthouse at the top offers panoramic views. Carry water as there are no vendors inside." },
    { name: "Dudhsagar Falls", lat: 15.3144, lng: 74.3143, category: "sightseeing", rating: 4.7, bestTime: "Monsoon (July-Sep)", tip: "Book a jeep safari from Mollem. The trek is 11km but worth every step." },
    { name: "Anjuna Flea Market", lat: 15.5725, lng: 73.7399, category: "shopping", rating: 4.1, bestTime: "Wednesday afternoons", tip: "Bargain hard — start at 50% of the quoted price. Best deals after 4 PM." },
    { name: "Basilica of Bom Jesus", lat: 15.5009, lng: 73.9116, category: "museum", rating: 4.6, bestTime: "Morning", tip: "A UNESCO World Heritage Site. Photography inside the basilica is not permitted." },
    { name: "Palolem Beach", lat: 15.0100, lng: 74.0232, category: "beach", rating: 4.6, bestTime: "Sunset", tip: "The most scenic beach in South Goa. Try the silent noise parties at Neptune's." },
    { name: "Chapora Fort", lat: 15.6040, lng: 73.7392, category: "sightseeing", rating: 4.2, bestTime: "Sunset", tip: "The 'Dil Chahta Hai' fort. Best sunset views in North Goa, but no railing — be careful." },
    { name: "Thalassa Restaurant", lat: 15.5972, lng: 73.7447, category: "restaurant", rating: 4.5, bestTime: "Dinner", tip: "Book a sunset table 2 days in advance. The Greek platter is legendary." },
    { name: "Fisherman's Wharf", lat: 15.4523, lng: 73.8520, category: "restaurant", rating: 4.4, bestTime: "Lunch", tip: "Try the Goan Fish Thali. Sit by the river for the best ambiance." },
    { name: "Curlies Beach Shack", lat: 15.5735, lng: 73.7384, category: "restaurant", rating: 4.0, bestTime: "Evening", tip: "Legendary beach shack in Anjuna. Famous for live music nights on Tuesdays." },
  ],
  bali: [
    { name: "Tanah Lot Temple", lat: -8.6212, lng: 115.0868, category: "museum", rating: 4.7, bestTime: "Sunset", tip: "Visit during low tide to walk to the temple base. The sunset here is iconic." },
    { name: "Tegallalang Rice Terraces", lat: -8.4312, lng: 115.2793, category: "sightseeing", rating: 4.5, bestTime: "Early morning", tip: "Arrive by 8 AM to beat tour groups. The swing here costs $15 but photos are priceless." },
    { name: "Uluwatu Temple", lat: -8.8291, lng: 115.0849, category: "museum", rating: 4.6, bestTime: "Sunset", tip: "Watch the Kecak Fire Dance at sunset (6 PM). Keep belongings secure — monkeys are notorious thieves." },
    { name: "Seminyak Beach", lat: -8.6906, lng: 115.1583, category: "beach", rating: 4.4, bestTime: "Sunset", tip: "Best beach clubs are Potato Head and La Plancha. Happy hour starts at 4 PM." },
    { name: "Sacred Monkey Forest", lat: -8.5170, lng: 115.2588, category: "sightseeing", rating: 4.3, bestTime: "Morning", tip: "Don't bring food or shiny objects. The monkeys will snatch sunglasses right off your face." },
    { name: "Mount Batur Sunrise Trek", lat: -8.2416, lng: 115.3752, category: "adventure", rating: 4.8, bestTime: "4 AM start", tip: "Book with a local guide (not hotel tours — they charge 3x). Hot springs after the trek." },
    { name: "Waterbom Bali", lat: -8.7208, lng: 115.1650, category: "adventure", rating: 4.6, bestTime: "All day", tip: "Asia's #1 waterpark. Book online for 30% off. Go on weekdays to avoid crowds." },
    { name: "Naughty Nuri's Warung", lat: -8.5163, lng: 115.2616, category: "restaurant", rating: 4.5, bestTime: "Lunch", tip: "The pork ribs are legendary. This tiny warung has a 30-year reputation." },
    { name: "Locavore Restaurant", lat: -8.5034, lng: 115.2631, category: "restaurant", rating: 4.8, bestTime: "Dinner", tip: "Voted Asia's #42 best restaurant. Book 2 weeks ahead. The tasting menu is a must." },
    { name: "Warung Babi Guling Ibu Oka", lat: -8.5027, lng: 115.2629, category: "restaurant", rating: 4.3, bestTime: "Lunch", tip: "The suckling pig is Barack Obama's favorite. Opens at 11 AM, sells out by 2 PM." },
  ],
  paris: [
    { name: "Eiffel Tower", lat: 48.8584, lng: 2.2945, category: "sightseeing", rating: 4.7, bestTime: "Sunset", tip: "Book the summit ticket online 60 days ahead. The 2nd floor restaurant is surprisingly affordable." },
    { name: "Louvre Museum", lat: 48.8606, lng: 2.3376, category: "museum", rating: 4.8, bestTime: "Wednesday/Friday evenings", tip: "Enter via the Carrousel entrance (underground) — zero wait. Free entry on first Sundays." },
    { name: "Montmartre & Sacré-Cœur", lat: 48.8867, lng: 2.3431, category: "sightseeing", rating: 4.5, bestTime: "Early morning", tip: "Skip the funicular, take the stairs for hidden street art. Place du Tertre artists are overpriced." },
    { name: "Seine River Cruise", lat: 48.8599, lng: 2.3063, category: "sightseeing", rating: 4.6, bestTime: "Evening", tip: "Bateaux Mouches at sunset is magical. BYO wine is perfectly legal and very Parisian." },
    { name: "Shakespeare and Company", lat: 48.8526, lng: 2.3471, category: "shopping", rating: 4.4, bestTime: "Afternoon", tip: "This legendary bookshop lets travelers sleep among the shelves. The upstairs reading room is hidden." },
    { name: "Le Marais District", lat: 48.8584, lng: 2.3620, category: "sightseeing", rating: 4.5, bestTime: "Afternoon", tip: "Best falafel at L'As du Fallafel. The Place des Vosges is Paris's oldest planned square." },
    { name: "Le Bouillon Chartier", lat: 48.8749, lng: 2.3482, category: "restaurant", rating: 4.3, bestTime: "Early dinner", tip: "A 1896 workers' canteen serving 3-course meals for €15. Always a queue — arrive at 6 PM sharp." },
    { name: "Pierre Hermé Patisserie", lat: 48.8541, lng: 2.3299, category: "restaurant", rating: 4.7, bestTime: "Morning", tip: "The Ispahan macaron is life-changing. The Rue Bonaparte shop is less crowded than Saint-Germain." },
    { name: "Café de Flore", lat: 48.8540, lng: 2.3326, category: "restaurant", rating: 4.2, bestTime: "Morning", tip: "Where Sartre and Hemingway wrote. Overpriced coffee, but you're paying for literary history." },
  ],
  tokyo: [
    { name: "Senso-ji Temple", lat: 35.7148, lng: 139.7967, category: "museum", rating: 4.6, bestTime: "Early morning", tip: "Visit at 6 AM for an empty temple. The Nakamise shopping street opens at 9 AM." },
    { name: "Shibuya Crossing", lat: 35.6595, lng: 139.7004, category: "sightseeing", rating: 4.5, bestTime: "Evening", tip: "Best viewed from Starbucks on the 2nd floor of QFRONT building. Friday nights are peak chaos." },
    { name: "Tsukiji Outer Market", lat: 35.6654, lng: 139.7707, category: "restaurant", rating: 4.7, bestTime: "Morning (6-10 AM)", tip: "The inner wholesale market moved to Toyosu, but the outer market still has the best sushi in Tokyo." },
    { name: "Meiji Shrine", lat: 35.6764, lng: 139.6993, category: "museum", rating: 4.5, bestTime: "Morning", tip: "Walk through the torii gates in Yoyogi Park. On Sundays you might witness a traditional Shinto wedding." },
    { name: "Akihabara Electric Town", lat: 35.6984, lng: 139.7731, category: "shopping", rating: 4.3, bestTime: "Afternoon", tip: "Floor by floor exploration — retro games on upper floors, maid cafes everywhere. Super Potato is a must." },
    { name: "TeamLab Borderless", lat: 35.6264, lng: 139.7839, category: "museum", rating: 4.8, bestTime: "Late afternoon", tip: "Book tickets online 1 month ahead. Wear white to become part of the art." },
    { name: "Shinjuku Gyoen", lat: 35.6852, lng: 139.7100, category: "sightseeing", rating: 4.6, bestTime: "Cherry blossom season", tip: "No alcohol allowed (unusual for Japan). The French Formal Garden section is stunning." },
    { name: "Ichiran Ramen Shibuya", lat: 35.6592, lng: 139.6996, category: "restaurant", rating: 4.5, bestTime: "Late night", tip: "Solo dining booths with customizable broth. Order extra Kaedama noodles for ¥190." },
    { name: "Gonpachi Nishi-Azabu", lat: 35.6560, lng: 139.7266, category: "restaurant", rating: 4.4, bestTime: "Dinner", tip: "The 'Kill Bill' restaurant. The yakitori and soba are excellent. Reserve the upper floor." },
  ],
  dubai: [
    { name: "Burj Khalifa", lat: 25.1972, lng: 55.2744, category: "sightseeing", rating: 4.8, bestTime: "Sunset", tip: "Book 'At the Top SKY' (148th floor) for the premium lounge. Sunset slot sells out weeks ahead." },
    { name: "Dubai Mall & Aquarium", lat: 25.1985, lng: 55.2796, category: "shopping", rating: 4.6, bestTime: "Afternoon", tip: "The aquarium walk-through tunnel is free. The fountain show outside runs every 30 mins from 6 PM." },
    { name: "Desert Safari", lat: 25.0556, lng: 55.4500, category: "adventure", rating: 4.5, bestTime: "Late afternoon", tip: "Book a sunrise safari for 70% fewer tourists. Include dune bashing + BBQ dinner under the stars." },
    { name: "Palm Jumeirah Boardwalk", lat: 25.1124, lng: 55.1390, category: "sightseeing", rating: 4.3, bestTime: "Evening", tip: "Walk the 11km boardwalk at sunset. The Atlantis view from the tip is breathtaking." },
    { name: "Al Fahidi Historical District", lat: 25.2637, lng: 55.2976, category: "museum", rating: 4.4, bestTime: "Morning", tip: "The real old Dubai. Coffee Museum and XVA Art Gallery are hidden gems. Free walking tours at 10 AM." },
    { name: "Pierchic Restaurant", lat: 25.1372, lng: 55.1630, category: "restaurant", rating: 4.6, bestTime: "Dinner", tip: "Built on a pier extending into the ocean. The seafood platter for two is legendary." },
    { name: "Ravi Restaurant", lat: 25.2290, lng: 55.2650, category: "restaurant", rating: 4.3, bestTime: "Late night", tip: "Dubai's worst-kept secret. Pakistani food at local prices (AED 20 per person). Cash only." },
  ],
  london: [
    { name: "Tower of London", lat: 51.5081, lng: -0.0759, category: "museum", rating: 4.7, bestTime: "Opening time (9 AM)", tip: "Join the free Beefeater tour immediately. Crown Jewels queue is shortest in the first 30 minutes." },
    { name: "British Museum", lat: 51.5194, lng: -0.1270, category: "museum", rating: 4.8, bestTime: "Friday evening", tip: "Free entry always. The Rosetta Stone and Parthenon Marbles are must-sees. Friday late opening until 8:30 PM." },
    { name: "Borough Market", lat: 51.5055, lng: -0.0910, category: "restaurant", rating: 4.5, bestTime: "Saturday morning", tip: "London's oldest food market (1000+ years). The Bread Ahead doughnuts are life-changing." },
    { name: "Sky Garden", lat: 51.5113, lng: -0.0836, category: "sightseeing", rating: 4.4, bestTime: "Sunset", tip: "FREE alternative to The Shard. Book online 3 weeks ahead. The cocktails are reasonably priced." },
    { name: "Camden Market", lat: 51.5416, lng: -0.1462, category: "shopping", rating: 4.3, bestTime: "Afternoon", tip: "Over 1000 stalls. The street food section is incredible value. Stables Market has vintage finds." },
    { name: "Dishoom King's Cross", lat: 51.5354, lng: -0.1248, category: "restaurant", rating: 4.6, bestTime: "Breakfast", tip: "Bombay-style café. The bacon naan roll is iconic. Walk-ins only for breakfast (opens 8 AM)." },
    { name: "Flat Iron Steak", lat: 51.5137, lng: -0.1350, category: "restaurant", rating: 4.5, bestTime: "Lunch", tip: "£12 steak with unlimited sides. Free popcorn while you wait. Beak Street is the original." },
  ],
  mumbai: [
    { name: "Gateway of India", lat: 19.0402, lng: 72.8347, category: "sightseeing", rating: 4.5, bestTime: "Early morning", tip: "Visit at sunrise for stunning photos. The ferry to Elephanta Caves departs from here." },
    { name: "Marine Drive", lat: 19.0748, lng: 72.8230, category: "sightseeing", rating: 4.6, bestTime: "Sunset", tip: "The 'Queen's Necklace' at night. Best viewed from Nariman Point. Street corn vendors are amazing." },
    { name: "Dhobi Ghat", lat: 19.0156, lng: 72.8415, category: "sightseeing", rating: 4.2, bestTime: "Morning", tip: "World's largest open-air laundry. The rooftop view is from the bridge near Mahalaxmi station." },
    { name: "Chhatrapati Shivaji Terminus", lat: 19.0827, lng: 72.8825, category: "museum", rating: 4.7, bestTime: "Evening (lit up)", tip: "A UNESCO World Heritage Site. The Gothic architecture is best photographed from across the street." },
    { name: "Leopold Café", lat: 18.9227, lng: 72.8317, category: "restaurant", rating: 4.1, bestTime: "Evening", tip: "The oldest café in Mumbai (1871). The bullet holes from 26/11 are still in the walls." },
    { name: "Britannia & Co", lat: 19.0565, lng: 72.8383, category: "restaurant", rating: 4.5, bestTime: "Lunch", tip: "Try the legendary Berry Pulao. Run by the same Parsi family since 1923. Cash only." },
  ],
  delhi: [
    { name: "Red Fort", lat: 28.6562, lng: 77.2410, category: "museum", rating: 4.5, bestTime: "Early morning", tip: "Open at sunrise. The Sound & Light show in the evening is spectacular." },
    { name: "India Gate", lat: 28.6129, lng: 77.2295, category: "sightseeing", rating: 4.4, bestTime: "Evening", tip: "Best visited at night when illuminated. Ice cream vendors around the lawns." },
    { name: "Qutub Minar", lat: 28.5245, lng: 77.1855, category: "museum", rating: 4.6, bestTime: "Morning", tip: "India's tallest brick minaret. The Iron Pillar nearby has been rust-free for 1600 years." },
    { name: "Chandni Chowk", lat: 28.6507, lng: 77.2334, category: "shopping", rating: 4.3, bestTime: "Morning", tip: "Asia's largest spice market. Try the paranthe at Paranthe Wali Gali (oldest eatery since 1872)." },
    { name: "Karim's Restaurant", lat: 28.6504, lng: 77.2336, category: "restaurant", rating: 4.5, bestTime: "Lunch", tip: "Mughal cuisine since 1913. The mutton burra kebab is unmatched. Near Jama Masjid." },
    { name: "Indian Accent", lat: 28.5921, lng: 77.1734, category: "restaurant", rating: 4.8, bestTime: "Dinner", tip: "India's #1 restaurant. The daulat ki chaat dessert is magical. Reserve 2 weeks ahead." },
  ],
  singapore: [
    { name: "Gardens by the Bay", lat: 1.2816, lng: 103.8636, category: "sightseeing", rating: 4.8, bestTime: "Evening (7:45 PM show)", tip: "The Supertree Grove light show is free. Cloud Forest dome is better than Flower Dome." },
    { name: "Marina Bay Sands SkyPark", lat: 1.2834, lng: 103.8607, category: "sightseeing", rating: 4.6, bestTime: "Sunset", tip: "Non-guests can visit the observation deck (SGD 26). The infinity pool is hotel guests only." },
    { name: "Hawker Chan", lat: 1.2845, lng: 103.8493, category: "restaurant", rating: 4.4, bestTime: "11 AM", tip: "World's cheapest Michelin-starred meal (SGD 3.80). Queue starts before opening." },
    { name: "Lau Pa Sat", lat: 1.2806, lng: 103.8504, category: "restaurant", rating: 4.3, bestTime: "Evening", tip: "Victorian cast-iron market building. The satay street opens after 7 PM — order from multiple stalls." },
    { name: "Little India", lat: 1.3065, lng: 103.8520, category: "sightseeing", rating: 4.2, bestTime: "Morning", tip: "The Tekka Centre hawker stall has the best biryani. Sri Veeramakaliamman Temple is stunning." },
  ],
};

// ============================================================
// Day Theme Generator
// ============================================================

const DAY_THEMES: Record<string, string[]> = {
  adventure: ["Adrenaline Rush Day", "Wilderness Expedition", "Extreme Sports Day", "Jungle Safari & Thrills", "Ocean Adventure Day", "Mountain Explorer Day", "Night Adventure"],
  relaxation: ["Spa & Wellness Retreat", "Beach Bliss Day", "Garden & Nature Walk", "Slow Morning Café Crawl", "Sunset Meditation", "Hot Springs & Healing", "Coastal Serenity"],
  cultural: ["Heritage Walk Day", "Art & Museum Immersion", "Local Festival Experience", "Sacred Temples Tour", "Traditional Craft Workshop", "Historic Quarter Discovery", "Cultural Performance Night"],
  honeymoon: ["Romantic Sunrise Start", "Couples Spa & Beach", "Candlelight Dinner Cruise", "Private Island Escape", "Sunset Champagne Toast", "Hidden Waterfall Hike", "Stargazing Night"],
  family: ["Theme Park Fun", "Wildlife & Zoo Day", "Beach & Water Sports", "Interactive Museum Day", "Street Food Safari", "Boat Ride & Scenic Tour", "Shopping & Souvenirs"],
  default: ["Explore & Discover", "Local Immersion Day", "Scenic Highlights", "Cultural Deep Dive", "Food & Nightlife", "Hidden Gems Day", "Adventure & Relax"],
};

// ============================================================
// Itinerary Generation
// ============================================================

export const generateItinerary = async (tripDetails: any) => {
  const schema = {
    title: "string",
    coverImage: "string (unsplash URL)",
    days: [
      {
        dayNumber: "number",
        date: "string (ISO)",
        theme: "string (e.g., 'Cultural Immersion Day')",
        activities: [
          {
            time: "string (e.g. 09:00 AM)",
            name: "string (real place name)",
            location: "string (area/neighborhood)",
            geoCoordinates: {
              lat: "number (exact real latitude)",
              lng: "number (exact real longitude)"
            },
            description: "string (2-3 sentences, vivid)",
            duration: "number (in minutes)",
            estimatedCost: "number",
            category: "string (beach, restaurant, museum, sightseeing, shopping, adventure, hotel, transport)",
            rating: "number (1.0 to 5.0)",
            isHiddenGem: "boolean",
            localTip: "string (insider tip for this specific place)",
            bestTimeToVisit: "string (e.g., 'Early morning', 'Sunset')",
            imageSearchQuery: "string (for Google Places photo lookup)",
          },
        ],
      },
    ],
  };

  const prompt = `Generate a highly detailed ${tripDetails.travelStyle} travel itinerary for ${tripDetails.travelers} people to ${tripDetails.destination} from ${tripDetails.startDate} to ${tripDetails.endDate}. Budget: ${tripDetails.budget} ${tripDetails.currency}. Transport: ${tripDetails.transportPreference}. Hotel: ${tripDetails.hotelCategory}. Food: ${tripDetails.foodPreference}.

CRITICAL RULES:
1. You MUST provide accurate real-world GPS coordinates (geoCoordinates with lat/lng) for EVERY single activity using real data.
2. Include at least 1 hidden gem per day (isHiddenGem: true) — lesser-known local spots that only locals know about.
3. Each activity MUST have a unique, practical localTip.
4. Each day MUST have a creative theme (e.g., "Cultural Immersion Day", "Beach & Adventure Day").
5. Include 4-5 activities per day: morning activity, lunch, afternoon activity, dinner, evening activity/hotel.
6. Use REAL place names, restaurants, and hotels that actually exist in ${tripDetails.destination}.

Return ONLY valid JSON matching this exact structure: ${JSON.stringify(schema)}`;

  if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== "mock_key") {
    const startTime = Date.now();
    try {
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
      });

      let text = response.text || "";
      // Strip markdown code blocks if present
      if (text.startsWith("```json"))
        text = text.replace(/```json\n|\n```/g, "");
      if (text.startsWith("```")) text = text.replace(/```\n|\n```/g, "");

      const result = JSON.parse(text);

      await prisma.aiUsageLog.create({
        data: {
          prompt: `Generate Trip: ${tripDetails.destination} for ${tripDetails.travelers} people`,
          latencyMs: Date.now() - startTime,
          tokens: text.length / 4,
          status: "success",
        },
      });

      return result;
    } catch (e) {
      console.error("AI generation failed, using fallback:", e);
      await prisma.aiUsageLog.create({
        data: {
          prompt: `Generate Trip: ${tripDetails.destination} for ${tripDetails.travelers} people`,
          latencyMs: Date.now() - startTime,
          tokens: 0,
          status: "failed",
        },
      });
    }
  }

  // ============================================================
  // Professional Mock Fallback
  // ============================================================
  return generateMockItinerary(tripDetails);
};

function generateMockItinerary(tripDetails: any) {
  const startDate = new Date(tripDetails.startDate);
  const endDate = new Date(tripDetails.endDate);
  const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  const days = [];
  let currentDate = new Date(startDate);

  const dest = (tripDetails.destination || "Goa").toLowerCase();
  const style = (tripDetails.travelStyle || "adventure").toLowerCase();
  const budget = tripDetails.budget || 50000;
  const dailyBudget = budget / diffDays;
  const hotelCat = tripDetails.hotelCategory || "4-star";

  // Find GPS coordinate data for destination
  const destKey = Object.keys(PLACE_COORDS).find((k) => dest.includes(k)) || "";
  const placeData = PLACE_COORDS[destKey] || [];

  // Find matching destination data for legacy pools
  const legacyDestKey = Object.keys(DESTINATION_DATA).find((k) => dest.includes(k)) || "";
  const dData = DESTINATION_DATA[legacyDestKey];

  // Get hotel info
  let hotelName = `${hotelCat} Hotel ${tripDetails.destination}`;
  let hotelRating = 4.2;
  if (dData) {
    if (hotelCat.includes("budget") || hotelCat.includes("hostel")) {
      hotelName = dData.hotels.budget;
      hotelRating = 3.8;
    } else if (hotelCat.includes("luxury") || hotelCat.includes("5")) {
      hotelName = dData.hotels.luxury;
      hotelRating = 4.9;
    } else {
      hotelName = dData.hotels.standard;
      hotelRating = 4.5;
    }
  }

  // Get day themes
  const themes = DAY_THEMES[style] || DAY_THEMES.default;

  // Separate places by category
  const sightseeing = placeData.filter((p) => ["sightseeing", "museum", "beach", "shopping", "adventure"].includes(p.category));
  const restaurants = placeData.filter((p) => p.category === "restaurant");

  // Build each day
  for (let i = 1; i <= diffDays; i++) {
    const dayTheme = themes[(i - 1) % themes.length];
    const isFirstDay = i === 1;
    const isLastDay = i === diffDays;

    const activities: any[] = [];

    // Pick places for this day (cycle through available places)
    const morningPlace = sightseeing.length > 0 ? sightseeing[(i * 2 - 2) % sightseeing.length] : null;
    const afternoonPlace = sightseeing.length > 1 ? sightseeing[(i * 2 - 1) % sightseeing.length] : null;
    const lunchRestaurant = restaurants.length > 0 ? restaurants[(i - 1) % restaurants.length] : null;
    const dinnerRestaurant = restaurants.length > 1 ? restaurants[(i) % restaurants.length] : lunchRestaurant;

    // First day: hotel check-in
    if (isFirstDay) {
      activities.push({
        time: "08:00 AM",
        name: `✈️ Arrive at ${tripDetails.destination}`,
        description: `Arrive at ${tripDetails.destination} airport/station. Pick up luggage and transfer to hotel. Take some time to freshen up and settle in.`,
        location: `${tripDetails.destination} Airport`,
        estimatedCost: Math.round(dailyBudget * 0.05),
        duration: 120,
        category: "transport",
        lat: morningPlace?.lat || 0,
        lng: morningPlace?.lng || 0,
        rating: null,
        isHiddenGem: false,
        localTip: "Pre-book airport transfer to avoid taxi scams. Many hotels offer free shuttle service.",
        bestTimeToVisit: "Morning",
      });

      activities.push({
        time: "10:30 AM",
        name: `🏨 Check-in: ${hotelName}`,
        description: `Check into ${hotelName}. ${hotelCat.includes("luxury") ? "Enjoy welcome drinks and a room tour." : "Drop your bags and get ready to explore!"} The staff can help arrange local excursions.`,
        location: tripDetails.destination,
        estimatedCost: Math.round(dailyBudget * (hotelCat.includes("luxury") ? 0.4 : hotelCat.includes("budget") ? 0.15 : 0.3)),
        duration: 60,
        category: "hotel",
        lat: morningPlace?.lat ? morningPlace.lat + 0.005 : 0,
        lng: morningPlace?.lng ? morningPlace.lng + 0.003 : 0,
        rating: hotelRating,
        isHiddenGem: false,
        localTip: "Ask for a room upgrade at check-in — off-season, hotels often upgrade for free.",
        bestTimeToVisit: "Check-in time",
      });
    }

    // Morning activity
    if (morningPlace && !isFirstDay) {
      activities.push({
        time: "09:00 AM",
        name: morningPlace.name,
        description: `Explore ${morningPlace.name} — a ${morningPlace.rating >= 4.5 ? "top-rated" : "beloved"} ${morningPlace.category} destination in ${tripDetails.destination}. ${morningPlace.tip.split(".")[0]}.`,
        location: morningPlace.name,
        estimatedCost: Math.round(dailyBudget * 0.1),
        duration: 150,
        category: morningPlace.category,
        lat: morningPlace.lat,
        lng: morningPlace.lng,
        rating: morningPlace.rating,
        isHiddenGem: morningPlace.rating < 4.3,
        localTip: morningPlace.tip,
        bestTimeToVisit: morningPlace.bestTime,
      });
    } else if (!isFirstDay) {
      // Fallback morning activity from legacy data
      const legacyPlace = dData?.places?.[(i - 1) % (dData?.places?.length || 1)];
      activities.push({
        time: "09:00 AM",
        name: legacyPlace?.title || `Explore ${tripDetails.destination} Highlights`,
        description: legacyPlace?.desc || `Discover the morning highlights of ${tripDetails.destination}. Visit local landmarks and soak in the atmosphere.`,
        location: legacyPlace?.location || "City Center",
        estimatedCost: Math.round(dailyBudget * 0.1),
        duration: 150,
        category: "sightseeing",
        lat: 0,
        lng: 0,
        rating: 4.2,
        isHiddenGem: false,
        localTip: "Ask your hotel concierge for the best local guide — they know hidden spots not on TripAdvisor.",
        bestTimeToVisit: "Morning",
      });
    }

    // Lunch
    if (lunchRestaurant) {
      activities.push({
        time: "12:30 PM",
        name: `🍽️ Lunch: ${lunchRestaurant.name}`,
        description: `Enjoy a leisurely lunch at ${lunchRestaurant.name}, rated ${lunchRestaurant.rating}/5. ${lunchRestaurant.tip.split(".")[0]}.`,
        location: lunchRestaurant.name,
        estimatedCost: Math.round(dailyBudget * 0.08),
        duration: 75,
        category: "restaurant",
        lat: lunchRestaurant.lat,
        lng: lunchRestaurant.lng,
        rating: lunchRestaurant.rating,
        isHiddenGem: lunchRestaurant.rating <= 4.3,
        localTip: lunchRestaurant.tip,
        bestTimeToVisit: lunchRestaurant.bestTime,
      });
    } else {
      const legacyFood = dData?.foods?.[(i - 1) % (dData?.foods?.length || 1)];
      activities.push({
        time: "12:30 PM",
        name: legacyFood ? `🍽️ ${legacyFood.name}` : `🍽️ Local Cuisine Experience`,
        description: legacyFood?.desc || `Sample authentic local dishes at a popular neighborhood restaurant.`,
        location: legacyFood?.spot || "Food District",
        estimatedCost: Math.round(dailyBudget * 0.06),
        duration: 75,
        category: "restaurant",
        lat: 0,
        lng: 0,
        rating: 4.3,
        isHiddenGem: false,
        localTip: "Ask for the 'local special' or 'chef's recommendation' — it's always the best value.",
        bestTimeToVisit: "Lunch",
      });
    }

    // Afternoon activity
    if (afternoonPlace) {
      activities.push({
        time: "02:30 PM",
        name: afternoonPlace.name,
        description: `Spend the afternoon at ${afternoonPlace.name}. ${afternoonPlace.tip.split(".")[0]}. A must-visit for any ${style} traveler.`,
        location: afternoonPlace.name,
        estimatedCost: Math.round(dailyBudget * 0.12),
        duration: 150,
        category: afternoonPlace.category,
        lat: afternoonPlace.lat,
        lng: afternoonPlace.lng,
        rating: afternoonPlace.rating,
        isHiddenGem: afternoonPlace.rating < 4.3,
        localTip: afternoonPlace.tip,
        bestTimeToVisit: afternoonPlace.bestTime,
      });
    } else {
      const legacyPlace = dData?.places?.[(i) % (dData?.places?.length || 1)];
      activities.push({
        time: "02:30 PM",
        name: legacyPlace?.title || `${tripDetails.destination} Afternoon Exploration`,
        description: legacyPlace?.desc || `Continue exploring the local area. Discover hidden alleyways, local shops, and scenic viewpoints.`,
        location: legacyPlace?.location || "Old Town",
        estimatedCost: Math.round(dailyBudget * 0.08),
        duration: 150,
        category: "sightseeing",
        lat: 0,
        lng: 0,
        rating: 4.0,
        isHiddenGem: true,
        localTip: "Wander off the main tourist path — the side streets often have the best street art and cafés.",
        bestTimeToVisit: "Afternoon",
      });
    }

    // Dinner
    if (dinnerRestaurant && dinnerRestaurant !== lunchRestaurant) {
      activities.push({
        time: "07:30 PM",
        name: `🍽️ Dinner: ${dinnerRestaurant.name}`,
        description: `End the day with a memorable dinner at ${dinnerRestaurant.name}. ${dinnerRestaurant.tip.split(".")[0]}.`,
        location: dinnerRestaurant.name,
        estimatedCost: Math.round(dailyBudget * 0.1),
        duration: 90,
        category: "restaurant",
        lat: dinnerRestaurant.lat,
        lng: dinnerRestaurant.lng,
        rating: dinnerRestaurant.rating,
        isHiddenGem: false,
        localTip: dinnerRestaurant.tip,
        bestTimeToVisit: dinnerRestaurant.bestTime,
      });
    } else {
      activities.push({
        time: "07:30 PM",
        name: "🍽️ Sunset Dinner Experience",
        description: `Enjoy a beautiful dinner at a local restaurant with views of ${tripDetails.destination}'s skyline. Try the chef's special for the best value.`,
        location: "Waterfront",
        estimatedCost: Math.round(dailyBudget * 0.1),
        duration: 90,
        category: "restaurant",
        lat: 0,
        lng: 0,
        rating: 4.3,
        isHiddenGem: false,
        localTip: "Restaurants with a view charge 20-30% more. For better food at better prices, eat where locals eat.",
        bestTimeToVisit: "Sunset",
      });
    }

    // Last day: checkout
    if (isLastDay) {
      activities.push({
        time: "10:00 PM",
        name: `🏨 Last Night: ${hotelName}`,
        description: `Pack your bags and prepare for departure. Don't forget to leave a review for the hotel and collect any laundry!`,
        location: tripDetails.destination,
        estimatedCost: 0,
        duration: 480,
        category: "hotel",
        lat: 0,
        lng: 0,
        rating: hotelRating,
        isHiddenGem: false,
        localTip: "Request a late checkout (often free if the hotel isn't full). Most hotels hold luggage after checkout.",
        bestTimeToVisit: "Evening",
      });
    } else {
      activities.push({
        time: "10:00 PM",
        name: `🏨 ${hotelName}`,
        description: `Return to ${hotelName} for a restful night. ${hotelCat.includes("luxury") ? "Enjoy the spa, pool, or rooftop bar before bed." : "Rest up for tomorrow's adventure!"}`,
        location: tripDetails.destination,
        estimatedCost: Math.round(dailyBudget * (hotelCat.includes("luxury") ? 0.4 : hotelCat.includes("budget") ? 0.15 : 0.3)),
        duration: 480,
        category: "hotel",
        lat: 0,
        lng: 0,
        rating: hotelRating,
        isHiddenGem: false,
        localTip: "Use the hotel's concierge to book tomorrow's activities at local rates, not tourist prices.",
        bestTimeToVisit: "Night",
      });
    }

    days.push({
      dayNumber: i,
      date: new Date(currentDate).toISOString(),
      theme: dayTheme,
      activities,
    });
    currentDate.setDate(currentDate.getDate() + 1);
  }

  // Add mock latency for realism
  const coverImages: Record<string, string> = {
    goa: "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=1200",
    bali: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=1200",
    paris: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=1200",
    tokyo: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=1200",
    dubai: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=1200",
    london: "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=1200",
    mumbai: "https://images.unsplash.com/photo-1570168007204-dfb528c6958f?w=1200",
    delhi: "https://images.unsplash.com/photo-1587474260584-136574528ed5?w=1200",
    singapore: "https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=1200",
  };

  return {
    title: `${tripDetails.travelStyle.charAt(0).toUpperCase() + tripDetails.travelStyle.slice(1)} Trip to ${tripDetails.destination}`,
    days,
    coverImage:
      coverImages[destKey] ||
      dData?.coverImage ||
      "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=1200",
  };
}

// ============================================================
// Contextual AI Chat
// ============================================================

interface ChatContext {
  tripDestination?: string;
  tripBudget?: number;
  tripCurrency?: string;
  tripDays?: any[];
  travelStyle?: string;
  transportPreference?: string;
  hotelCategory?: string;
  foodPreference?: string;
}

interface ChatResponse {
  reply: string;
  actions?: ChatAction[];
  suggestions?: string[];
}

interface ChatAction {
  type:
    | "swap_hotel"
    | "modify_day"
    | "add_activity"
    | "remove_activity"
    | "adjust_budget"
    | "change_restaurant"
    | "info";
  label: string;
  data?: Record<string, any>;
}

export const chatWithContext = async (
  message: string,
  context: ChatContext,
  chatHistory: { role: string; content: string }[] = [],
): Promise<ChatResponse> => {
  // Build context prompt
  const systemPrompt = `You are TripCraft AI, an expert travel assistant. You are helping a user modify and optimize their trip itinerary.

CURRENT TRIP CONTEXT:
- Destination: ${context.tripDestination || "Not specified"}
- Budget: ${context.tripBudget || "Not specified"} ${context.tripCurrency || "INR"}
- Travel Style: ${context.travelStyle || "Not specified"}
- Transport: ${context.transportPreference || "Any"}
- Hotel Category: ${context.hotelCategory || "Any"}
- Food Preference: ${context.foodPreference || "Any"}
- Itinerary Days: ${
    context.tripDays
      ? JSON.stringify(
          context.tripDays.map((d: any, i: number) => ({
            day: i + 1,
            morning: d.morningActivity?.title,
            afternoon: d.afternoonActivity?.title,
            evening: d.eveningActivity?.title,
            hotel: d.hotel?.name,
          })),
        )
      : "Not generated yet"
  }

RESPONSE FORMAT:
You MUST respond with valid JSON matching this structure:
{
  "reply": "Your natural language response to the user",
  "actions": [
    {
      "type": "swap_hotel" | "modify_day" | "add_activity" | "remove_activity" | "adjust_budget" | "change_restaurant" | "info",
      "label": "Short action button label",
      "data": { "optional": "context data" }
    }
  ],
  "suggestions": ["Follow-up question 1", "Follow-up question 2"]
}

Rules:
- Be concise, friendly, and specific with recommendations
- When suggesting changes, include actionable items in the "actions" array
- Always include 2-3 follow-up suggestions
- Reference specific details from the trip context when relevant
- If the user asks about restaurants, suggest specific types based on their food preference
- If they mention budget, calculate savings based on actual trip budget
- Always provide location-specific, practical advice`;

  if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== "mock_key") {
    try {
      // Build chat history for context
      const historyStr = chatHistory
        .slice(-6) // Keep last 6 messages for context
        .map((m) => `${m.role === "user" ? "User" : "Assistant"}: ${m.content}`)
        .join("\n");

      const fullPrompt = `${systemPrompt}\n\nCHAT HISTORY:\n${historyStr}\n\nUser: ${message}\n\nRespond with ONLY valid JSON:`;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: fullPrompt,
      });

      let text = response.text || "";
      // Strip markdown code blocks
      text = text
        .replace(/```json\n?/g, "")
        .replace(/\n?```/g, "")
        .trim();

      try {
        const parsed = JSON.parse(text);
        return {
          reply: parsed.reply || text,
          actions: parsed.actions || [],
          suggestions: parsed.suggestions || [],
        };
      } catch {
        // If JSON parsing fails, return the text as-is
        return {
          reply: text,
          actions: [],
          suggestions: [
            "Tell me more about this destination",
            "How can I save money on this trip?",
            "Suggest activities for kids",
          ],
        };
      }
    } catch (e) {
      console.error("AI chat failed, using smart fallback:", e);
    }
  }

  // ===== Smart Mock Fallback =====
  return generateSmartMockResponse(message, context);
};

function generateSmartMockResponse(
  message: string,
  context: ChatContext,
): ChatResponse {
  const msg = message.toLowerCase();
  const dest = context.tripDestination || "your destination";
  const budget = context.tripBudget || 50000;
  const currency = context.tripCurrency || "INR";

  // Vegetarian / restaurant queries
  if (
    msg.includes("vegetarian") ||
    msg.includes("veg restaurant") ||
    msg.includes("veg food")
  ) {
    return {
      reply: `Great choice! I found 3 highly-rated vegetarian restaurants near your hotel in ${dest}:\n\n🥗 **Green Leaf Café** — Pure veg, rated 4.7 (₹800/person)\n🌿 **Sattvik Kitchen** — North Indian thali, rated 4.5 (₹600/person)\n🍃 **Garden Bistro** — Multi-cuisine veg, rated 4.6 (₹500/person)\n\nI can add Green Leaf Café to your Day 2 lunch. Shall I?`,
      actions: [
        {
          type: "change_restaurant",
          label: "Add Green Leaf to Day 2",
          data: { day: 2, meal: "lunch", restaurant: "Green Leaf Café" },
        },
        { type: "info", label: "Show all veg options" },
      ],
      suggestions: [
        "Show non-veg options too",
        "Find cafes for breakfast",
        "Any street food recommendations?",
      ],
    };
  }

  // Walking / modify day
  if (
    msg.includes("less walking") ||
    msg.includes("reduce walking") ||
    msg.includes("too much walking")
  ) {
    return {
      reply: `I understand! I'll optimize Day 3 to reduce walking. Here's what I'd change:\n\n🔄 **Replace** "Walking City Tour" → **Hop-on Hop-off Bus Tour** (covers same spots, less effort)\n🚕 **Add** cab rides between attractions instead of walking\n⏰ **Extend** lunch break from 1hr → 1.5hrs for rest\n\nThis reduces walking by approximately 60% while keeping all major attractions.`,
      actions: [
        {
          type: "modify_day",
          label: "Apply changes to Day 3",
          data: { day: 3, change: "reduce-walking" },
        },
        { type: "info", label: "See modified schedule" },
      ],
      suggestions: [
        "Apply this to all days",
        "Add more rest breaks",
        "Find wheelchair-accessible attractions",
      ],
    };
  }

  // Budget reduction
  if (
    msg.includes("budget") ||
    msg.includes("reduce") ||
    msg.includes("save") ||
    msg.includes("cheaper") ||
    msg.includes("₹")
  ) {
    const savings = Math.round(budget * 0.15);
    return {
      reply: `I can help reduce your budget! Here are my top recommendations:\n\n🏨 **Hotel Downgrade**: Switch from 4-star to a top-rated 3-star boutique hotel → Save **${currency === "INR" ? "₹" : "$"}${(savings * 0.6).toLocaleString()}**/night\n🍽️ **Street Food Day**: Replace Day 2 restaurant dinner with popular street food → Save **${currency === "INR" ? "₹" : "$"}${(savings * 0.15).toLocaleString()}**\n🎫 **Free Attractions**: Swap paid museum on Day 3 with free walking tour → Save **${currency === "INR" ? "₹" : "$"}${(savings * 0.1).toLocaleString()}**\n\n💰 **Total Savings: ~${currency === "INR" ? "₹" : "$"}${savings.toLocaleString()}**`,
      actions: [
        {
          type: "swap_hotel",
          label: "Switch to 3-star hotel",
          data: { from: "4-star", to: "3-star" },
        },
        {
          type: "adjust_budget",
          label: `Save ${currency === "INR" ? "₹" : "$"}${savings.toLocaleString()}`,
          data: { amount: savings },
        },
      ],
      suggestions: [
        "Show me the cheapest options only",
        "What if I cook my own meals?",
        "Any free activities available?",
      ],
    };
  }

  // Weather queries
  if (
    msg.includes("weather") ||
    msg.includes("rain") ||
    msg.includes("temperature") ||
    msg.includes("hot") ||
    msg.includes("cold")
  ) {
    return {
      reply: `Here's the weather outlook for ${dest}:\n\n🌤️ **Overall**: Mostly sunny with occasional clouds\n🌡️ **Temperature**: 26-32°C during the day, 22-24°C at night\n🌧️ **Rain Probability**: ~20% on Day 2 and Day 4\n💨 **Wind**: Light breeze, 10-15 km/h\n\n**My Tip**: Pack a light rain jacket for Day 2 & 4. I'd recommend moving outdoor activities to mornings on those days.`,
      actions: [
        {
          type: "modify_day",
          label: "Swap Day 2 outdoor activities",
          data: { day: 2, reason: "weather" },
        },
        { type: "info", label: "See hour-by-hour forecast" },
      ],
      suggestions: [
        "Should I pack an umbrella?",
        "Move beach day to a sunny day",
        "Indoor activities for rainy days?",
      ],
    };
  }

  // Attractions / things to do
  if (
    msg.includes("things to do") ||
    msg.includes("attractions") ||
    msg.includes("places to visit") ||
    msg.includes("must see")
  ) {
    return {
      reply: `Here are the top must-visit attractions in ${dest} that I recommend:\n\n⭐ **Top Pick**: Main Heritage Site — Rated 4.8, best visited early morning\n🏛️ **Cultural**: Local Museum & Art Gallery — 2-3 hours, entry ₹200\n🌅 **Scenic**: Sunset Viewpoint — Free entry, arrive 5 PM for best views\n🛍️ **Shopping**: Night Market — Open 6-11 PM, great for souvenirs\n🍽️ **Food Tour**: Old City Food Walk — 3 hours, ₹800/person\n\nAll of these are already included across your ${context.tripDays?.length || 5}-day itinerary!`,
      actions: [
        {
          type: "add_activity",
          label: "Add food tour to Day 4",
          data: { day: 4, activity: "Old City Food Walk" },
        },
        { type: "info", label: "Show hidden gems" },
      ],
      suggestions: [
        "Show off-beat places",
        "Any adventure activities?",
        "Kid-friendly attractions?",
      ],
    };
  }

  // Default response
  return {
    reply: `I'd be happy to help you with your trip to ${dest}! I can assist with:\n\n📍 Finding the best restaurants, cafés, and hotels\n💰 Optimizing your budget and finding savings\n📅 Adjusting your daily itinerary and activities\n🌤️ Weather-based planning and recommendations\n🎒 Packing suggestions and travel tips\n\nWhat would you like to know or change?`,
    actions: [{ type: "info", label: "Show trip summary" }],
    suggestions: [
      "Find vegetarian restaurants near my hotel",
      `Reduce budget by ₹5000`,
      "Plan Day 3 with less walking",
    ],
  };
}

// ============================================================
// Day Regeneration
// ============================================================

export const regenerateDay = async (
  tripId: string,
  dayNumber: number,
  preferences: any,
): Promise<any> => {
  const dest = preferences?.destination || "Goa";
  const destKey = Object.keys(PLACE_COORDS).find((k) => dest.toLowerCase().includes(k)) || "";
  const placeData = PLACE_COORDS[destKey] || [];
  const sightseeing = placeData.filter((p) => p.category !== "restaurant");
  const restaurants = placeData.filter((p) => p.category === "restaurant");
  const budget = preferences?.budget || 50000;
  const dailyBudget = budget / 7;

  // Shuffle and pick different places for regeneration
  const shuffled = [...sightseeing].sort(() => Math.random() - 0.5);
  const shuffledFood = [...restaurants].sort(() => Math.random() - 0.5);

  const morningPlace = shuffled[0];
  const afternoonPlace = shuffled[1] || shuffled[0];
  const lunch = shuffledFood[0];
  const dinner = shuffledFood[1] || shuffledFood[0];

  const activities = [];

  if (morningPlace) {
    activities.push({
      time: "09:00 AM",
      name: morningPlace.name,
      description: `Explore ${morningPlace.name} — ${morningPlace.tip.split(".")[0]}.`,
      location: morningPlace.name,
      estimatedCost: Math.round(dailyBudget * 0.1),
      duration: 150,
      category: morningPlace.category,
      lat: morningPlace.lat,
      lng: morningPlace.lng,
      rating: morningPlace.rating,
      isHiddenGem: morningPlace.rating < 4.3,
      localTip: morningPlace.tip,
      bestTimeToVisit: morningPlace.bestTime,
    });
  }

  if (lunch) {
    activities.push({
      time: "12:30 PM",
      name: `🍽️ Lunch: ${lunch.name}`,
      description: `Enjoy lunch at ${lunch.name}, rated ${lunch.rating}/5.`,
      location: lunch.name,
      estimatedCost: Math.round(dailyBudget * 0.08),
      duration: 75,
      category: "restaurant",
      lat: lunch.lat,
      lng: lunch.lng,
      rating: lunch.rating,
      isHiddenGem: false,
      localTip: lunch.tip,
      bestTimeToVisit: lunch.bestTime,
    });
  }

  if (afternoonPlace) {
    activities.push({
      time: "02:30 PM",
      name: afternoonPlace.name,
      description: `Spend the afternoon at ${afternoonPlace.name}. ${afternoonPlace.tip.split(".")[0]}.`,
      location: afternoonPlace.name,
      estimatedCost: Math.round(dailyBudget * 0.12),
      duration: 150,
      category: afternoonPlace.category,
      lat: afternoonPlace.lat,
      lng: afternoonPlace.lng,
      rating: afternoonPlace.rating,
      isHiddenGem: true,
      localTip: afternoonPlace.tip,
      bestTimeToVisit: afternoonPlace.bestTime,
    });
  }

  if (dinner) {
    activities.push({
      time: "07:30 PM",
      name: `🍽️ Dinner: ${dinner.name}`,
      description: `End the day at ${dinner.name}. ${dinner.tip.split(".")[0]}.`,
      location: dinner.name,
      estimatedCost: Math.round(dailyBudget * 0.1),
      duration: 90,
      category: "restaurant",
      lat: dinner.lat,
      lng: dinner.lng,
      rating: dinner.rating,
      isHiddenGem: false,
      localTip: dinner.tip,
      bestTimeToVisit: dinner.bestTime,
    });
  }

  return {
    dayNumber,
    theme: "Regenerated: Fresh Discoveries",
    activities,
  };
};

// ============================================================
// Alternative Activity Generation
// ============================================================

export const getAlternativeActivities = async (
  activityName: string,
  destination: string,
): Promise<any[]> => {
  const destKey = Object.keys(PLACE_COORDS).find((k) => destination.toLowerCase().includes(k)) || "";
  const placeData = PLACE_COORDS[destKey] || [];

  // Filter out the current activity and pick 3 alternatives
  const alternatives = placeData
    .filter((p) => p.name !== activityName)
    .sort(() => Math.random() - 0.5)
    .slice(0, 3)
    .map((p) => ({
      name: p.name,
      category: p.category,
      rating: p.rating,
      lat: p.lat,
      lng: p.lng,
      localTip: p.tip,
      bestTimeToVisit: p.bestTime,
      isHiddenGem: p.rating < 4.3,
    }));

  return alternatives.length > 0
    ? alternatives
    : [
        { name: `${destination} City Walk`, category: "sightseeing", rating: 4.2, lat: 0, lng: 0, localTip: "Explore at your own pace.", bestTimeToVisit: "Morning", isHiddenGem: false },
        { name: `Local Market Tour`, category: "shopping", rating: 4.0, lat: 0, lng: 0, localTip: "Bargain for the best deals.", bestTimeToVisit: "Afternoon", isHiddenGem: true },
        { name: `Sunset Photography Walk`, category: "sightseeing", rating: 4.5, lat: 0, lng: 0, localTip: "Golden hour starts 1 hour before sunset.", bestTimeToVisit: "Sunset", isHiddenGem: true },
      ];
};
