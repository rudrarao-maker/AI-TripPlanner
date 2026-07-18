import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || 'mock' });

export const generateItinerary = async (tripDetails: any) => {
  const schema = {
    title: "string",
    coverImage: "string",
    days: [
      {
        dayNumber: "number",
        date: "string (ISO)",
        morningActivity: { title: "string", description: "string", location: "string", cost: "number" },
        afternoonActivity: { title: "string", description: "string", location: "string", cost: "number" },
        eveningActivity: { title: "string", description: "string", location: "string", cost: "number" },
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
      morningActivity: { title: `Explore ${tripDetails.destination} Landmarks`, description: `Visit top sites in ${tripDetails.destination}.`, location: `City Center`, cost: 20 },
      afternoonActivity: { title: 'Local Market & Shopping', description: 'Discover local crafts and souvenirs.', location: 'Central Market', cost: 50 },
      eveningActivity: { title: 'Sunset Views & Dining', description: 'Enjoy a beautiful sunset.', location: 'Scenic Viewpoint', cost: 30 },
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

