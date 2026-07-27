import { GoogleGenAI } from '@google/genai';
import { DESTINATION_DATA } from '../data/destinations';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || 'mock' });

// ============================================================
// Prompt Parsing
// ============================================================

export const parseUserPrompt = async (prompt: string) => {
  const schema = {
    destinations: ["string"],
    travelers: "number",
    budget: "number (optional)",
    currency: "string (e.g., INR, USD)",
    dates: "string (e.g., December, next week, or specific dates)",
    travelStyle: "string (e.g., adventure, relaxation, honeymoon, family)",
    hotelCategory: "string (e.g., luxury, 4-star, budget)",
  };

  const sysPrompt = `Extract travel parameters from the following user prompt. Return ONLY valid JSON matching this schema: ${JSON.stringify(schema)}. If a parameter is not mentioned, make a reasonable guess or leave it empty.
  
  User Prompt: "${prompt}"`;

  if (process.env.GEMINI_API_KEY) {
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: sysPrompt,
      });
      
      let text = response.text || '';
      text = text.replace(/```json\n?/g, '').replace(/\n?```/g, '').trim();
      return JSON.parse(text);
    } catch (e) {
      console.error('Failed to parse prompt with AI, using fallback:', e);
    }
  }

  // Very basic regex fallback if no API key
  const destMatch = prompt.match(/to\s+([A-Z][a-z]+(\s+[A-Z][a-z]+)*)/);
  const budgetMatch = prompt.match(/(?:for|budget)\s*(?:\$|₹|INR|USD)?\s*(\d+(?:,\d+)*)/);
  const travelersMatch = prompt.match(/(two|three|four|five|\d+)\s+people/);
  
  const wordToNum: Record<string, number> = { two: 2, three: 3, four: 4, five: 5 };
  
  return {
    destinations: destMatch ? [destMatch[1]] : ['Goa'],
    travelers: travelersMatch ? (wordToNum[travelersMatch[1].toLowerCase()] || parseInt(travelersMatch[1])) : 2,
    budget: budgetMatch ? parseInt(budgetMatch[1].replace(/,/g, '')) : 50000,
    currency: prompt.includes('$') ? 'USD' : 'INR',
    dates: 'next month',
    travelStyle: prompt.toLowerCase().includes('honeymoon') ? 'honeymoon' : 'adventure',
    hotelCategory: prompt.toLowerCase().includes('luxury') ? 'luxury' : '4-star',
  };
};

// ============================================================
// Itinerary Generation
// ============================================================

export const generateItinerary = async (tripDetails: any) => {
  const schema = {
    title: "string",
    coverImage: "string",
    days: [
      {
        dayNumber: "number",
        date: "string (ISO)",
        morningActivity: { title: "string", description: "string", location: "string", cost: "number", duration: "string" },
        afternoonActivity: { title: "string", description: "string", location: "string", cost: "number", duration: "string" },
        eveningActivity: { title: "string", description: "string", location: "string", cost: "number", duration: "string" },
        hotel: { name: "string", rating: "number", pricePerNight: "number" }
      }
    ]
  };

  const prompt = `Generate a ${tripDetails.travelStyle} travel itinerary for ${tripDetails.travelers} people to ${tripDetails.destination} from ${tripDetails.startDate} to ${tripDetails.endDate}. Budget: ${tripDetails.budget} ${tripDetails.currency}. Transport: ${tripDetails.transportPreference}. Hotel: ${tripDetails.hotelCategory}. Food: ${tripDetails.foodPreference}.
  Return ONLY valid JSON matching this structure: ${JSON.stringify(schema)}`;

  if (process.env.GEMINI_API_KEY) {
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });
      
      let text = response.text || '';
      // Strip markdown code blocks if present
      if (text.startsWith('```json')) text = text.replace(/```json\n|\n```/g, '');
      if (text.startsWith('```')) text = text.replace(/```\n|\n```/g, '');
      
      return JSON.parse(text);
    } catch (e) {
      console.error('AI generation failed, using fallback:', e);
    }
  }

  // Fallback / Smart Mock
  await new Promise((resolve) => setTimeout(resolve, 1500));
  
  const startDate = new Date(tripDetails.startDate);
  const endDate = new Date(tripDetails.endDate);
  const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  const days = [];
  let currentDate = new Date(startDate);

  const dest = (tripDetails.destination || 'Goa').toLowerCase();
  const style = (tripDetails.travelStyle || 'adventure').toLowerCase();
  const foodPref = (tripDetails.foodPreference || 'any').toLowerCase();
  const budget = tripDetails.budget || 50000;
  const dailyBudget = budget / diffDays;
  const hotelCat = tripDetails.hotelCategory || '4-star';

  // Find matching destination data or use generic
  const destKey = Object.keys(DESTINATION_DATA).find(k => dest.includes(k)) || '';
  const dData = DESTINATION_DATA[destKey];

  // ============ Build activities pool from destination data ============
  let placesPool: { title: string; desc: string; location: string; costMul: number }[] = [];
  let foodsPool: { title: string; desc: string; location: string; costMul: number }[] = [];
  let hotelName = `${hotelCat} Stay ${tripDetails.destination}`;

  if (dData) {
    // Filter places by travel style if possible, otherwise use all
    const styleMap: Record<string, string[]> = {
      adventure: ['adventure'],
      relaxation: ['relaxation'],
      cultural: ['cultural', 'shopping'],
    };
    const matchTypes = styleMap[style] || [];
    const filtered = matchTypes.length > 0 ? dData.places.filter(p => matchTypes.includes(p.type)) : dData.places;
    placesPool = (filtered.length >= 3 ? filtered : dData.places).map(p => ({
      title: p.title,
      desc: p.desc,
      location: p.location,
      costMul: p.type === 'adventure' ? 0.15 : p.type === 'relaxation' ? 0.08 : 0.05,
    }));

    const foodFiltered = foodPref.includes('veg') ? dData.foods.filter(f => f.name.toLowerCase().includes('veg') || f.desc.toLowerCase().includes('plant')) : dData.foods;
    foodsPool = (foodFiltered.length > 0 ? foodFiltered : dData.foods).map(f => ({
      title: `🍽️ ${f.name}`,
      desc: `${f.desc} 📍 ${f.spot}`,
      location: f.spot,
      costMul: f.cost,
    }));

    // Pick hotel based on category
    if (hotelCat.includes('budget') || hotelCat.includes('hostel')) hotelName = dData.hotels.budget;
    else if (hotelCat.includes('luxury') || hotelCat.includes('5')) hotelName = dData.hotels.luxury;
    else hotelName = dData.hotels.standard;
  } else {
    // Generic fallback pool
    placesPool = [
      { title: `Explore ${tripDetails.destination} Old Town`, desc: 'Walk through the historic quarter, visiting local landmarks, street art, and hidden courtyards.', location: 'City Center', costMul: 0.05 },
      { title: `${tripDetails.destination} Scenic Viewpoint`, desc: 'Panoramic views of the entire region. Best visited at golden hour for photographs.', location: 'Hilltop', costMul: 0.03 },
      { title: 'Local Art & Craft Market', desc: 'Shop for handmade souvenirs, local spices, textiles, and artisan pottery.', location: 'Market Square', costMul: 0.05 },
      { title: `Nature Trail & Wildlife Walk`, desc: 'Guided 2-hour walk through local flora and fauna with expert naturalist.', location: 'Nature Reserve', costMul: 0.08 },
      { title: `${tripDetails.destination} Heritage Museum`, desc: 'Learn about the region\'s fascinating history, architecture, and cultural evolution.', location: 'Museum District', costMul: 0.04 },
      { title: 'Sunset Boat Cruise', desc: 'Relaxing 90-minute cruise with snacks and live music as the sun sets.', location: 'Waterfront', costMul: 0.12 },
    ];
    foodsPool = [
      { title: '🍽️ Local Thali Experience', desc: 'A grand platter of regional specialties — curries, breads, rice, and dessert.', location: 'Food Street', costMul: 0.04 },
      { title: '🍽️ Street Food Walking Tour', desc: 'Guided tour sampling 6+ iconic street food stalls with a local foodie.', location: 'Old Town', costMul: 0.05 },
      { title: '🍽️ Rooftop Fine Dining', desc: 'Multi-course dinner with panoramic views, craft cocktails, and live acoustic music.', location: 'City Center', costMul: 0.08 },
    ];
  }

  // ============ Build days ============
  for (let i = 1; i <= diffDays; i++) {
    const morningPlace = placesPool[(i - 1) % placesPool.length];
    const afternoonPlace = placesPool[(i + 1) % placesPool.length];
    const food = foodsPool[(i - 1) % foodsPool.length];

    days.push({
      dayNumber: i,
      date: new Date(currentDate).toISOString(),
      morningActivity: {
        title: morningPlace.title,
        description: morningPlace.desc,
        location: morningPlace.location,
        cost: Math.round(dailyBudget * morningPlace.costMul),
        duration: '3 hours',
      },
      afternoonActivity: {
        title: afternoonPlace.title,
        description: afternoonPlace.desc,
        location: afternoonPlace.location,
        cost: Math.round(dailyBudget * afternoonPlace.costMul),
        duration: '2.5 hours',
      },
      eveningActivity: {
        title: food.title,
        description: food.desc,
        location: food.location,
        cost: Math.round(dailyBudget * food.costMul),
        duration: '1.5 hours',
      },
      hotel: {
        name: hotelName,
        rating: hotelCat.includes('luxury') ? 4.9 : hotelCat.includes('budget') ? 3.8 : 4.5,
        pricePerNight: Math.round(dailyBudget * (hotelCat.includes('luxury') ? 0.4 : hotelCat.includes('budget') ? 0.15 : 0.3)),
      },
    });
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return {
    title: `${tripDetails.travelStyle} Trip to ${tripDetails.destination}`,
    days,
    coverImage: dData?.coverImage || 'https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?w=800',
  };
};

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
  type: 'swap_hotel' | 'modify_day' | 'add_activity' | 'remove_activity' | 'adjust_budget' | 'change_restaurant' | 'info';
  label: string;
  data?: Record<string, any>;
}

export const chatWithContext = async (
  message: string,
  context: ChatContext,
  chatHistory: { role: string; content: string }[] = []
): Promise<ChatResponse> => {
  // Build context prompt
  const systemPrompt = `You are TripCraft AI, an expert travel assistant. You are helping a user modify and optimize their trip itinerary.

CURRENT TRIP CONTEXT:
- Destination: ${context.tripDestination || 'Not specified'}
- Budget: ${context.tripBudget || 'Not specified'} ${context.tripCurrency || 'INR'}
- Travel Style: ${context.travelStyle || 'Not specified'}
- Transport: ${context.transportPreference || 'Any'}
- Hotel Category: ${context.hotelCategory || 'Any'}
- Food Preference: ${context.foodPreference || 'Any'}
- Itinerary Days: ${context.tripDays ? JSON.stringify(context.tripDays.map((d: any, i: number) => ({
    day: i + 1,
    morning: d.morningActivity?.title,
    afternoon: d.afternoonActivity?.title,
    evening: d.eveningActivity?.title,
    hotel: d.hotel?.name
  }))) : 'Not generated yet'}

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

  if (process.env.GEMINI_API_KEY) {
    try {
      // Build chat history for context
      const historyStr = chatHistory
        .slice(-6) // Keep last 6 messages for context
        .map(m => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`)
        .join('\n');

      const fullPrompt = `${systemPrompt}\n\nCHAT HISTORY:\n${historyStr}\n\nUser: ${message}\n\nRespond with ONLY valid JSON:`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: fullPrompt,
      });

      let text = response.text || '';
      // Strip markdown code blocks
      text = text.replace(/```json\n?/g, '').replace(/\n?```/g, '').trim();

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
          suggestions: ['Tell me more about this destination', 'How can I save money on this trip?', 'Suggest activities for kids'],
        };
      }
    } catch (e) {
      console.error('AI chat failed, using smart fallback:', e);
    }
  }

  // ===== Smart Mock Fallback =====
  return generateSmartMockResponse(message, context);
};

function generateSmartMockResponse(message: string, context: ChatContext): ChatResponse {
  const msg = message.toLowerCase();
  const dest = context.tripDestination || 'your destination';
  const budget = context.tripBudget || 50000;
  const currency = context.tripCurrency || 'INR';

  // Vegetarian / restaurant queries
  if (msg.includes('vegetarian') || msg.includes('veg restaurant') || msg.includes('veg food')) {
    return {
      reply: `Great choice! I found 3 highly-rated vegetarian restaurants near your hotel in ${dest}:\n\n🥗 **Green Leaf Café** — Pure veg, rated 4.7 (₹800/person)\n🌿 **Sattvik Kitchen** — North Indian thali, rated 4.5 (₹600/person)\n🍃 **Garden Bistro** — Multi-cuisine veg, rated 4.6 (₹500/person)\n\nI can add Green Leaf Café to your Day 2 lunch. Shall I?`,
      actions: [
        { type: 'change_restaurant', label: 'Add Green Leaf to Day 2', data: { day: 2, meal: 'lunch', restaurant: 'Green Leaf Café' } },
        { type: 'info', label: 'Show all veg options' },
      ],
      suggestions: ['Show non-veg options too', 'Find cafes for breakfast', 'Any street food recommendations?'],
    };
  }

  // Walking / modify day
  if (msg.includes('less walking') || msg.includes('reduce walking') || msg.includes('too much walking')) {
    return {
      reply: `I understand! I'll optimize Day 3 to reduce walking. Here's what I'd change:\n\n🔄 **Replace** "Walking City Tour" → **Hop-on Hop-off Bus Tour** (covers same spots, less effort)\n🚕 **Add** cab rides between attractions instead of walking\n⏰ **Extend** lunch break from 1hr → 1.5hrs for rest\n\nThis reduces walking by approximately 60% while keeping all major attractions.`,
      actions: [
        { type: 'modify_day', label: 'Apply changes to Day 3', data: { day: 3, change: 'reduce-walking' } },
        { type: 'info', label: 'See modified schedule' },
      ],
      suggestions: ['Apply this to all days', 'Add more rest breaks', 'Find wheelchair-accessible attractions'],
    };
  }

  // Budget reduction
  if (msg.includes('budget') || msg.includes('reduce') || msg.includes('save') || msg.includes('cheaper') || msg.includes('₹')) {
    const savings = Math.round(budget * 0.15);
    return {
      reply: `I can help reduce your budget! Here are my top recommendations:\n\n🏨 **Hotel Downgrade**: Switch from 4-star to a top-rated 3-star boutique hotel → Save **${currency === 'INR' ? '₹' : '$'}${(savings * 0.6).toLocaleString()}**/night\n🍽️ **Street Food Day**: Replace Day 2 restaurant dinner with popular street food → Save **${currency === 'INR' ? '₹' : '$'}${(savings * 0.15).toLocaleString()}**\n🎫 **Free Attractions**: Swap paid museum on Day 3 with free walking tour → Save **${currency === 'INR' ? '₹' : '$'}${(savings * 0.1).toLocaleString()}**\n\n💰 **Total Savings: ~${currency === 'INR' ? '₹' : '$'}${savings.toLocaleString()}**`,
      actions: [
        { type: 'swap_hotel', label: 'Switch to 3-star hotel', data: { from: '4-star', to: '3-star' } },
        { type: 'adjust_budget', label: `Save ${currency === 'INR' ? '₹' : '$'}${savings.toLocaleString()}`, data: { amount: savings } },
      ],
      suggestions: ['Show me the cheapest options only', 'What if I cook my own meals?', 'Any free activities available?'],
    };
  }

  // Weather queries
  if (msg.includes('weather') || msg.includes('rain') || msg.includes('temperature') || msg.includes('hot') || msg.includes('cold')) {
    return {
      reply: `Here's the weather outlook for ${dest}:\n\n🌤️ **Overall**: Mostly sunny with occasional clouds\n🌡️ **Temperature**: 26-32°C during the day, 22-24°C at night\n🌧️ **Rain Probability**: ~20% on Day 2 and Day 4\n💨 **Wind**: Light breeze, 10-15 km/h\n\n**My Tip**: Pack a light rain jacket for Day 2 & 4. I'd recommend moving outdoor activities to mornings on those days.`,
      actions: [
        { type: 'modify_day', label: 'Swap Day 2 outdoor activities', data: { day: 2, reason: 'weather' } },
        { type: 'info', label: 'See hour-by-hour forecast' },
      ],
      suggestions: ['Should I pack an umbrella?', 'Move beach day to a sunny day', 'Indoor activities for rainy days?'],
    };
  }

  // Attractions / things to do
  if (msg.includes('things to do') || msg.includes('attractions') || msg.includes('places to visit') || msg.includes('must see')) {
    return {
      reply: `Here are the top must-visit attractions in ${dest} that I recommend:\n\n⭐ **Top Pick**: Main Heritage Site — Rated 4.8, best visited early morning\n🏛️ **Cultural**: Local Museum & Art Gallery — 2-3 hours, entry ₹200\n🌅 **Scenic**: Sunset Viewpoint — Free entry, arrive 5 PM for best views\n🛍️ **Shopping**: Night Market — Open 6-11 PM, great for souvenirs\n🍽️ **Food Tour**: Old City Food Walk — 3 hours, ₹800/person\n\nAll of these are already included across your ${context.tripDays?.length || 5}-day itinerary!`,
      actions: [
        { type: 'add_activity', label: 'Add food tour to Day 4', data: { day: 4, activity: 'Old City Food Walk' } },
        { type: 'info', label: 'Show hidden gems' },
      ],
      suggestions: ['Show off-beat places', 'Any adventure activities?', 'Kid-friendly attractions?'],
    };
  }

  // Default response
  return {
    reply: `I'd be happy to help you with your trip to ${dest}! I can assist with:\n\n📍 Finding the best restaurants, cafés, and hotels\n💰 Optimizing your budget and finding savings\n📅 Adjusting your daily itinerary and activities\n🌤️ Weather-based planning and recommendations\n🎒 Packing suggestions and travel tips\n\nWhat would you like to know or change?`,
    actions: [
      { type: 'info', label: 'Show trip summary' },
    ],
    suggestions: [
      'Find vegetarian restaurants near my hotel',
      `Reduce budget by ₹5000`,
      'Plan Day 3 with less walking',
    ],
  };
}
