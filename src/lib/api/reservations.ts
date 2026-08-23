export interface ReservationStatus {
  success: boolean;
  confirmationNumber?: string;
  message: string;
  time?: string;
  restaurantName?: string;
}

/**
 * Mock function to check OpenTable/Resy for table availability
 */
export async function checkTableAvailability(restaurantName: string, date: string, partySize: number, preferredTime: string): Promise<string[]> {
  await new Promise(resolve => setTimeout(resolve, 500));
  console.log(`Checking availability for ${restaurantName} on ${date} for ${partySize} around ${preferredTime}`);
  
  // Return some mock available times around preferred time
  // E.g., if preferred is 19:00, return 18:30, 19:00, 19:45
  return ["18:30", "19:00", "19:45"];
}

/**
 * Mock function to automatically book a table
 */
export async function autoBookTable(restaurantName: string, date: string, time: string, partySize: number, userDetails: any): Promise<ReservationStatus> {
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  // 90% success rate for mock
  if (Math.random() > 0.1) {
    const confirmation = Math.random().toString(36).substring(2, 10).toUpperCase();
    return {
      success: true,
      confirmationNumber: confirmation,
      message: "Successfully booked!",
      time,
      restaurantName,
    };
  } else {
    return {
      success: false,
      message: "Failed to secure table. Please try a different time.",
    };
  }
}
