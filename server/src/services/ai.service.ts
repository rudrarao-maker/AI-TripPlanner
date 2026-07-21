import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || 'mock' });

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

  // Fallback / Mock
  await new Promise((resolve) => setTimeout(resolve, 1500));
  
  const startDate = new Date(tripDetails.startDate);
  const endDate = new Date(tripDetails.endDate);
  const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  const days = [];
  let currentDate = new Date(startDate);

  for (let i = 1; i <= diffDays; i++) {
    days.push({
      dayNumber: i,
      date: new Date(currentDate).toISOString(),
      morningActivity: { title: `Explore ${tripDetails.destination} Landmarks`, description: `Visit top sites in ${tripDetails.destination}.`, location: `City Center`, cost: 20, duration: '3 hours' },
      afternoonActivity: { title: 'Local Market & Shopping', description: 'Discover local crafts and souvenirs.', location: 'Central Market', cost: 50, duration: '2 hours' },
      eveningActivity: { title: 'Sunset Views & Dining', description: 'Enjoy a beautiful sunset.', location: 'Scenic Viewpoint', cost: 30, duration: '2.5 hours' },
      hotel: { name: `Premium Stay ${tripDetails.destination}`, rating: 4.5, pricePerNight: (tripDetails.budget || 20000) * 0.2 },
    });
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return {
    title: `${tripDetails.travelStyle} trip to ${tripDetails.destination}`,
    days,
    coverImage: `https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?w=800`,
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
