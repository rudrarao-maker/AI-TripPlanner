export interface EventItem {
  id: string;
  name: string;
  date: string;
  venue: string;
  category: string;
  url: string;
  description: string;
}

/**
 * Mock function to fetch local events from Ticketmaster/Eventbrite
 * In a production environment, this would call the actual APIs with a location radius and dates.
 */
export async function getLocalEvents(lat: number, lng: number, startDate: string, endDate: string): Promise<EventItem[]> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 800));

  console.log(`Fetching events near ${lat}, ${lng} between ${startDate} and ${endDate}`);

  // Mock data based on the dates
  return [
    {
      id: "ev-1",
      name: "Coldplay: Music of the Spheres World Tour",
      date: startDate, // Make it match the start date for relevance
      venue: "Main Stadium",
      category: "Concert",
      url: "https://ticketmaster.com/coldplay",
      description: "Experience the magic of Coldplay live in concert.",
    },
    {
      id: "ev-2",
      name: "Local Food & Wine Festival",
      date: new Date(new Date(startDate).getTime() + 86400000).toISOString(), // Start date + 1 day
      venue: "City Park",
      category: "Festival",
      url: "https://eventbrite.com/food-festival",
      description: "Taste the best local cuisines and wines.",
    },
    {
      id: "ev-3",
      name: "Modern Art Exhibition Opening",
      date: endDate,
      venue: "National Gallery",
      category: "Art",
      url: "https://eventbrite.com/art-exhibition",
      description: "Exclusive opening night for the new modern art exhibit.",
    }
  ];
}
