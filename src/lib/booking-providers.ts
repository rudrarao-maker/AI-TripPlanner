/**
 * Booking Providers deep-link generators.
 * Generates affiliate or deep links to various aggregators based on trip parameters.
 */

export const generateFlightBookingLink = (origin: string, destination: string, startDate?: string, endDate?: string) => {
  // Skyscanner uses YYMMDD format
  let dateParams = "";
  if (startDate && endDate) {
    const startD = new Date(startDate);
    const endD = new Date(endDate);
    
    const formatSSDate = (d: Date) => {
      const yy = String(d.getFullYear()).slice(2);
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      return `${yy}${mm}${dd}`;
    };
    
    dateParams = `/${formatSSDate(startD)}/${formatSSDate(endD)}`;
  }
  return `https://www.skyscanner.com/transport/flights/${origin || "Any"}/${destination}${dateParams}`;
};

export const generateHotelBookingLink = (destination: string, startDate?: string, endDate?: string, adults = 2, children = 0) => {
  let queryParams = `ss=${encodeURIComponent(destination)}`;
  if (startDate && endDate) {
    queryParams += `&checkin=${startDate.split('T')[0]}&checkout=${endDate.split('T')[0]}`;
  }
  queryParams += `&group_adults=${adults}&group_children=${children}`;
  return `https://www.booking.com/searchresults.html?${queryParams}`;
};

export const generateActivityBookingLink = (activityName: string, destination: string) => {
  // Generate a deep link for GetYourGuide or Viator
  const query = encodeURIComponent(`${activityName} in ${destination}`);
  return `https://www.getyourguide.com/s?q=${query}`;
};

export const generateRestaurantBookingLink = (restaurantName: string, destination: string) => {
  // Generate a deep link for OpenTable or TripAdvisor
  const query = encodeURIComponent(`${restaurantName} ${destination}`);
  return `https://www.tripadvisor.com/Search?q=${query}`;
};
