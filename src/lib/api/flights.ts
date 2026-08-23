export interface PriceForecast {
  currentPrice: number;
  lowestHistoricalPrice: number;
  highestHistoricalPrice: number;
  prediction: "BUY" | "WAIT";
  expectedDrop?: number;
  alternativeAirport?: {
    code: string;
    name: string;
    savings: number;
    extraTransitTimeMinutes: number;
  };
  trendData: { date: string; price: number }[];
}

/**
 * Mock function to fetch flight price forecast from Amadeus/Skyscanner API
 */
export async function getPriceForecast(origin: string, destination: string, date: string): Promise<PriceForecast> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 600));

  console.log(`Fetching price forecast for flights from ${origin} to ${destination} around ${date}`);

  // Generate some mock trend data for the last 14 days
  const trendData = [];
  let basePrice = 600 + Math.random() * 200;
  for (let i = 14; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    trendData.push({
      date: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      price: Math.round(basePrice + (Math.random() * 50 - 25)),
    });
  }

  const currentPrice = trendData[trendData.length - 1].price;
  const lowest = Math.min(...trendData.map(t => t.price));
  const highest = Math.max(...trendData.map(t => t.price));

  return {
    currentPrice,
    lowestHistoricalPrice: lowest,
    highestHistoricalPrice: highest,
    prediction: currentPrice > lowest + 50 ? "WAIT" : "BUY",
    expectedDrop: currentPrice > lowest + 50 ? Math.round(currentPrice - lowest) : undefined,
    alternativeAirport: {
      code: "ALT",
      name: "Alternative Regional Airport",
      savings: Math.round(currentPrice * 0.3), // 30% savings
      extraTransitTimeMinutes: 45,
    },
    trendData,
  };
}
