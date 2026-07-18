// This service abstracts the AI provider.
// Initially, we will use mock data so the app works without an API key.

export const generateItinerary = async (tripDetails: any) => {
  // Simulate AI latency
  await new Promise((resolve) => setTimeout(resolve, 3000));

  // Generate a mock itinerary based on dates
  const startDate = new Date(tripDetails.startDate);
  const endDate = new Date(tripDetails.endDate);
  
  // Calculate days
  const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

  const days = [];
  let currentDate = new Date(startDate);

  for (let i = 1; i <= diffDays; i++) {
    days.push({
      dayNumber: i,
      date: new Date(currentDate).toISOString(),
      morningActivity: {
        title: `Explore ${tripDetails.destination} Landmarks`,
        description: `Visit the top historical and cultural sites in ${tripDetails.destination}.`,
        location: `${tripDetails.destination} City Center`,
        cost: 20,
      },
      afternoonActivity: {
        title: 'Local Market Tour & Shopping',
        description: 'Discover local crafts, spices, and souvenirs.',
        location: 'Central Market',
        cost: 50,
      },
      eveningActivity: {
        title: 'Sunset Views & Entertainment',
        description: 'Enjoy a beautiful sunset followed by local entertainment.',
        location: 'Scenic Viewpoint',
        cost: 30,
      },
      hotel: {
        name: `Premium Stay ${tripDetails.destination}`,
        rating: 4.5,
        pricePerNight: tripDetails.budget * 0.2, // Rough estimation
      },
      budgetUsed: 150,
    });
    
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return {
    title: `${tripDetails.travelStyle} trip to ${tripDetails.destination}`,
    days,
    estimatedBudget: tripDetails.budget,
    coverImage: `https://source.unsplash.com/1600x900/?${tripDetails.destination},travel`,
  };
};
