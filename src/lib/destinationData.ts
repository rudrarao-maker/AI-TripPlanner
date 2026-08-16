/**
 * Destination data for auto-budget estimation and passport/visa advisory.
 * Costs are approximate per-person per-day in INR.
 */

export interface DestinationInfo {
  name: string;
  country: string;
  state?: string;
  isInternational: boolean; // true = outside India
  dailyCostBudget: number;  // INR per day
  dailyCostModerate: number;
  dailyCostLuxury: number;
  currency: string;
  currencySymbol: string;
  visaRequired: boolean;
  visaType: string; // "not-required" | "on-arrival" | "e-visa" | "embassy"
  visaNote: string;
  adapterType: string; // power plug type
  insuranceRecommended: boolean;
}

const DESTINATIONS: DestinationInfo[] = [
  // ─── DOMESTIC (India) ─────────────────────────────────────
  { name: "Goa", country: "India", state: "Goa", isInternational: false, dailyCostBudget: 2000, dailyCostModerate: 5000, dailyCostLuxury: 15000, currency: "INR", currencySymbol: "₹", visaRequired: false, visaType: "not-required", visaNote: "", adapterType: "Type C/D/M", insuranceRecommended: false },
  { name: "Manali", country: "India", state: "Himachal Pradesh", isInternational: false, dailyCostBudget: 1500, dailyCostModerate: 4000, dailyCostLuxury: 12000, currency: "INR", currencySymbol: "₹", visaRequired: false, visaType: "not-required", visaNote: "", adapterType: "Type C/D/M", insuranceRecommended: false },
  { name: "Jaipur", country: "India", state: "Rajasthan", isInternational: false, dailyCostBudget: 1500, dailyCostModerate: 4000, dailyCostLuxury: 15000, currency: "INR", currencySymbol: "₹", visaRequired: false, visaType: "not-required", visaNote: "", adapterType: "Type C/D/M", insuranceRecommended: false },
  { name: "Kerala", country: "India", state: "Kerala", isInternational: false, dailyCostBudget: 2000, dailyCostModerate: 5000, dailyCostLuxury: 18000, currency: "INR", currencySymbol: "₹", visaRequired: false, visaType: "not-required", visaNote: "", adapterType: "Type C/D/M", insuranceRecommended: false },
  { name: "Ladakh", country: "India", state: "Ladakh", isInternational: false, dailyCostBudget: 2500, dailyCostModerate: 5500, dailyCostLuxury: 15000, currency: "INR", currencySymbol: "₹", visaRequired: false, visaType: "not-required", visaNote: "Inner Line Permit required for some areas", adapterType: "Type C/D/M", insuranceRecommended: true },
  { name: "Udaipur", country: "India", state: "Rajasthan", isInternational: false, dailyCostBudget: 1500, dailyCostModerate: 4500, dailyCostLuxury: 20000, currency: "INR", currencySymbol: "₹", visaRequired: false, visaType: "not-required", visaNote: "", adapterType: "Type C/D/M", insuranceRecommended: false },
  { name: "Mumbai", country: "India", state: "Maharashtra", isInternational: false, dailyCostBudget: 2500, dailyCostModerate: 6000, dailyCostLuxury: 20000, currency: "INR", currencySymbol: "₹", visaRequired: false, visaType: "not-required", visaNote: "", adapterType: "Type C/D/M", insuranceRecommended: false },
  { name: "Delhi", country: "India", state: "Delhi", isInternational: false, dailyCostBudget: 2000, dailyCostModerate: 5000, dailyCostLuxury: 18000, currency: "INR", currencySymbol: "₹", visaRequired: false, visaType: "not-required", visaNote: "", adapterType: "Type C/D/M", insuranceRecommended: false },
  { name: "Bangalore", country: "India", state: "Karnataka", isInternational: false, dailyCostBudget: 2000, dailyCostModerate: 5000, dailyCostLuxury: 15000, currency: "INR", currencySymbol: "₹", visaRequired: false, visaType: "not-required", visaNote: "", adapterType: "Type C/D/M", insuranceRecommended: false },
  { name: "Chennai", country: "India", state: "Tamil Nadu", isInternational: false, dailyCostBudget: 1800, dailyCostModerate: 4500, dailyCostLuxury: 14000, currency: "INR", currencySymbol: "₹", visaRequired: false, visaType: "not-required", visaNote: "", adapterType: "Type C/D/M", insuranceRecommended: false },
  { name: "Kolkata", country: "India", state: "West Bengal", isInternational: false, dailyCostBudget: 1500, dailyCostModerate: 4000, dailyCostLuxury: 12000, currency: "INR", currencySymbol: "₹", visaRequired: false, visaType: "not-required", visaNote: "", adapterType: "Type C/D/M", insuranceRecommended: false },
  { name: "Hyderabad", country: "India", state: "Telangana", isInternational: false, dailyCostBudget: 1800, dailyCostModerate: 4500, dailyCostLuxury: 14000, currency: "INR", currencySymbol: "₹", visaRequired: false, visaType: "not-required", visaNote: "", adapterType: "Type C/D/M", insuranceRecommended: false },
  { name: "Varanasi", country: "India", state: "Uttar Pradesh", isInternational: false, dailyCostBudget: 1200, dailyCostModerate: 3500, dailyCostLuxury: 10000, currency: "INR", currencySymbol: "₹", visaRequired: false, visaType: "not-required", visaNote: "", adapterType: "Type C/D/M", insuranceRecommended: false },
  { name: "Agra", country: "India", state: "Uttar Pradesh", isInternational: false, dailyCostBudget: 1500, dailyCostModerate: 4000, dailyCostLuxury: 12000, currency: "INR", currencySymbol: "₹", visaRequired: false, visaType: "not-required", visaNote: "", adapterType: "Type C/D/M", insuranceRecommended: false },
  { name: "Shimla", country: "India", state: "Himachal Pradesh", isInternational: false, dailyCostBudget: 1500, dailyCostModerate: 4000, dailyCostLuxury: 12000, currency: "INR", currencySymbol: "₹", visaRequired: false, visaType: "not-required", visaNote: "", adapterType: "Type C/D/M", insuranceRecommended: false },
  { name: "Rishikesh", country: "India", state: "Uttarakhand", isInternational: false, dailyCostBudget: 1200, dailyCostModerate: 3500, dailyCostLuxury: 10000, currency: "INR", currencySymbol: "₹", visaRequired: false, visaType: "not-required", visaNote: "", adapterType: "Type C/D/M", insuranceRecommended: false },
  { name: "Ooty", country: "India", state: "Tamil Nadu", isInternational: false, dailyCostBudget: 1500, dailyCostModerate: 4000, dailyCostLuxury: 12000, currency: "INR", currencySymbol: "₹", visaRequired: false, visaType: "not-required", visaNote: "", adapterType: "Type C/D/M", insuranceRecommended: false },
  { name: "Mysore", country: "India", state: "Karnataka", isInternational: false, dailyCostBudget: 1500, dailyCostModerate: 3500, dailyCostLuxury: 10000, currency: "INR", currencySymbol: "₹", visaRequired: false, visaType: "not-required", visaNote: "", adapterType: "Type C/D/M", insuranceRecommended: false },
  { name: "Darjeeling", country: "India", state: "West Bengal", isInternational: false, dailyCostBudget: 1500, dailyCostModerate: 4000, dailyCostLuxury: 12000, currency: "INR", currencySymbol: "₹", visaRequired: false, visaType: "not-required", visaNote: "", adapterType: "Type C/D/M", insuranceRecommended: false },
  { name: "Andaman", country: "India", state: "Andaman and Nicobar Islands", isInternational: false, dailyCostBudget: 3000, dailyCostModerate: 6000, dailyCostLuxury: 18000, currency: "INR", currencySymbol: "₹", visaRequired: false, visaType: "not-required", visaNote: "RAP/PAP required for tribal areas", adapterType: "Type C/D/M", insuranceRecommended: true },
  { name: "Leh", country: "India", state: "Ladakh", isInternational: false, dailyCostBudget: 2500, dailyCostModerate: 5500, dailyCostLuxury: 15000, currency: "INR", currencySymbol: "₹", visaRequired: false, visaType: "not-required", visaNote: "Inner Line Permit required", adapterType: "Type C/D/M", insuranceRecommended: true },
  { name: "Pune", country: "India", state: "Maharashtra", isInternational: false, dailyCostBudget: 1800, dailyCostModerate: 4500, dailyCostLuxury: 14000, currency: "INR", currencySymbol: "₹", visaRequired: false, visaType: "not-required", visaNote: "", adapterType: "Type C/D/M", insuranceRecommended: false },
  { name: "Coorg", country: "India", state: "Karnataka", isInternational: false, dailyCostBudget: 2000, dailyCostModerate: 5000, dailyCostLuxury: 15000, currency: "INR", currencySymbol: "₹", visaRequired: false, visaType: "not-required", visaNote: "", adapterType: "Type C/D/M", insuranceRecommended: false },
  { name: "Amritsar", country: "India", state: "Punjab", isInternational: false, dailyCostBudget: 1200, dailyCostModerate: 3500, dailyCostLuxury: 10000, currency: "INR", currencySymbol: "₹", visaRequired: false, visaType: "not-required", visaNote: "", adapterType: "Type C/D/M", insuranceRecommended: false },
  { name: "Jodhpur", country: "India", state: "Rajasthan", isInternational: false, dailyCostBudget: 1500, dailyCostModerate: 4000, dailyCostLuxury: 15000, currency: "INR", currencySymbol: "₹", visaRequired: false, visaType: "not-required", visaNote: "", adapterType: "Type C/D/M", insuranceRecommended: false },

  // ─── INTERNATIONAL ────────────────────────────────────────
  { name: "Paris", country: "France", isInternational: true, dailyCostBudget: 6000, dailyCostModerate: 15000, dailyCostLuxury: 40000, currency: "EUR", currencySymbol: "€", visaRequired: true, visaType: "embassy", visaNote: "Schengen visa required — apply 3-4 weeks in advance", adapterType: "Type C/E", insuranceRecommended: true },
  { name: "London", country: "United Kingdom", isInternational: true, dailyCostBudget: 7000, dailyCostModerate: 18000, dailyCostLuxury: 50000, currency: "GBP", currencySymbol: "£", visaRequired: true, visaType: "embassy", visaNote: "UK Standard Visitor visa — apply 3-8 weeks in advance", adapterType: "Type G", insuranceRecommended: true },
  { name: "Dubai", country: "UAE", isInternational: true, dailyCostBudget: 5000, dailyCostModerate: 12000, dailyCostLuxury: 35000, currency: "AED", currencySymbol: "د.إ", visaRequired: true, visaType: "on-arrival", visaNote: "14-day visa on arrival for Indian passport holders", adapterType: "Type G", insuranceRecommended: true },
  { name: "Singapore", country: "Singapore", isInternational: true, dailyCostBudget: 5000, dailyCostModerate: 12000, dailyCostLuxury: 30000, currency: "SGD", currencySymbol: "S$", visaRequired: true, visaType: "e-visa", visaNote: "E-visa available — apply online 30 days before", adapterType: "Type G", insuranceRecommended: true },
  { name: "Bangkok", country: "Thailand", isInternational: true, dailyCostBudget: 2500, dailyCostModerate: 6000, dailyCostLuxury: 18000, currency: "THB", currencySymbol: "฿", visaRequired: false, visaType: "not-required", visaNote: "Visa-free for Indian passport holders up to 30 days", adapterType: "Type A/B/C", insuranceRecommended: true },
  { name: "Phuket", country: "Thailand", isInternational: true, dailyCostBudget: 3000, dailyCostModerate: 7000, dailyCostLuxury: 20000, currency: "THB", currencySymbol: "฿", visaRequired: false, visaType: "not-required", visaNote: "Visa-free for Indian passport holders up to 30 days", adapterType: "Type A/B/C", insuranceRecommended: true },
  { name: "Bali", country: "Indonesia", isInternational: true, dailyCostBudget: 2500, dailyCostModerate: 6000, dailyCostLuxury: 20000, currency: "IDR", currencySymbol: "Rp", visaRequired: true, visaType: "on-arrival", visaNote: "30-day visa on arrival (₹2,500 fee)", adapterType: "Type C/F", insuranceRecommended: true },
  { name: "Tokyo", country: "Japan", isInternational: true, dailyCostBudget: 6000, dailyCostModerate: 14000, dailyCostLuxury: 40000, currency: "JPY", currencySymbol: "¥", visaRequired: true, visaType: "embassy", visaNote: "Embassy visa required — apply 1-2 weeks in advance", adapterType: "Type A/B", insuranceRecommended: true },
  { name: "New York", country: "USA", isInternational: true, dailyCostBudget: 8000, dailyCostModerate: 20000, dailyCostLuxury: 60000, currency: "USD", currencySymbol: "$", visaRequired: true, visaType: "embassy", visaNote: "US B1/B2 visa required — apply well in advance", adapterType: "Type A/B", insuranceRecommended: true },
  { name: "Los Angeles", country: "USA", isInternational: true, dailyCostBudget: 7000, dailyCostModerate: 18000, dailyCostLuxury: 50000, currency: "USD", currencySymbol: "$", visaRequired: true, visaType: "embassy", visaNote: "US B1/B2 visa required", adapterType: "Type A/B", insuranceRecommended: true },
  { name: "Sydney", country: "Australia", isInternational: true, dailyCostBudget: 7000, dailyCostModerate: 16000, dailyCostLuxury: 45000, currency: "AUD", currencySymbol: "A$", visaRequired: true, visaType: "e-visa", visaNote: "eVisitor visa — apply online", adapterType: "Type I", insuranceRecommended: true },
  { name: "Maldives", country: "Maldives", isInternational: true, dailyCostBudget: 5000, dailyCostModerate: 15000, dailyCostLuxury: 60000, currency: "MVR", currencySymbol: "Rf", visaRequired: false, visaType: "on-arrival", visaNote: "30-day visa on arrival — free for Indian passport holders", adapterType: "Type G", insuranceRecommended: true },
  { name: "Sri Lanka", country: "Sri Lanka", isInternational: true, dailyCostBudget: 2000, dailyCostModerate: 5000, dailyCostLuxury: 15000, currency: "LKR", currencySymbol: "Rs", visaRequired: true, visaType: "e-visa", visaNote: "ETA required — apply online", adapterType: "Type D/G", insuranceRecommended: true },
  { name: "Nepal", country: "Nepal", isInternational: true, dailyCostBudget: 1500, dailyCostModerate: 3500, dailyCostLuxury: 10000, currency: "NPR", currencySymbol: "रू", visaRequired: false, visaType: "not-required", visaNote: "No visa required for Indian citizens — carry valid ID", adapterType: "Type C/D/M", insuranceRecommended: true },
  { name: "Bhutan", country: "Bhutan", isInternational: true, dailyCostBudget: 3000, dailyCostModerate: 8000, dailyCostLuxury: 20000, currency: "BTN", currencySymbol: "Nu", visaRequired: false, visaType: "not-required", visaNote: "No visa for Indian citizens — permit arranged on arrival", adapterType: "Type D/F/G", insuranceRecommended: true },
  { name: "Vietnam", country: "Vietnam", isInternational: true, dailyCostBudget: 2000, dailyCostModerate: 5000, dailyCostLuxury: 15000, currency: "VND", currencySymbol: "₫", visaRequired: true, visaType: "e-visa", visaNote: "E-visa available — apply online", adapterType: "Type A/C", insuranceRecommended: true },
  { name: "Malaysia", country: "Malaysia", isInternational: true, dailyCostBudget: 2500, dailyCostModerate: 6000, dailyCostLuxury: 18000, currency: "MYR", currencySymbol: "RM", visaRequired: true, visaType: "e-visa", visaNote: "eNTRI or e-visa available", adapterType: "Type G", insuranceRecommended: true },
  { name: "Rome", country: "Italy", isInternational: true, dailyCostBudget: 5500, dailyCostModerate: 14000, dailyCostLuxury: 38000, currency: "EUR", currencySymbol: "€", visaRequired: true, visaType: "embassy", visaNote: "Schengen visa required", adapterType: "Type C/F/L", insuranceRecommended: true },
  { name: "Barcelona", country: "Spain", isInternational: true, dailyCostBudget: 5000, dailyCostModerate: 13000, dailyCostLuxury: 35000, currency: "EUR", currencySymbol: "€", visaRequired: true, visaType: "embassy", visaNote: "Schengen visa required", adapterType: "Type C/F", insuranceRecommended: true },
  { name: "Amsterdam", country: "Netherlands", isInternational: true, dailyCostBudget: 6000, dailyCostModerate: 15000, dailyCostLuxury: 40000, currency: "EUR", currencySymbol: "€", visaRequired: true, visaType: "embassy", visaNote: "Schengen visa required", adapterType: "Type C/F", insuranceRecommended: true },
  { name: "Istanbul", country: "Turkey", isInternational: true, dailyCostBudget: 3000, dailyCostModerate: 7000, dailyCostLuxury: 20000, currency: "TRY", currencySymbol: "₺", visaRequired: true, visaType: "e-visa", visaNote: "E-visa available — apply online before travel", adapterType: "Type C/F", insuranceRecommended: true },
  { name: "Cairo", country: "Egypt", isInternational: true, dailyCostBudget: 2000, dailyCostModerate: 5000, dailyCostLuxury: 15000, currency: "EGP", currencySymbol: "E£", visaRequired: true, visaType: "on-arrival", visaNote: "Visa on arrival available", adapterType: "Type C", insuranceRecommended: true },
  { name: "Mauritius", country: "Mauritius", isInternational: true, dailyCostBudget: 4000, dailyCostModerate: 10000, dailyCostLuxury: 30000, currency: "MUR", currencySymbol: "₨", visaRequired: false, visaType: "not-required", visaNote: "Visa-free up to 60 days", adapterType: "Type C/G", insuranceRecommended: true },
  { name: "Seoul", country: "South Korea", isInternational: true, dailyCostBudget: 5000, dailyCostModerate: 12000, dailyCostLuxury: 35000, currency: "KRW", currencySymbol: "₩", visaRequired: true, visaType: "embassy", visaNote: "Embassy visa required", adapterType: "Type C/F", insuranceRecommended: true },
  { name: "Hong Kong", country: "Hong Kong", isInternational: true, dailyCostBudget: 5000, dailyCostModerate: 12000, dailyCostLuxury: 35000, currency: "HKD", currencySymbol: "HK$", visaRequired: false, visaType: "not-required", visaNote: "Visa-free up to 14 days", adapterType: "Type G", insuranceRecommended: true },
  { name: "Abu Dhabi", country: "UAE", isInternational: true, dailyCostBudget: 5000, dailyCostModerate: 12000, dailyCostLuxury: 35000, currency: "AED", currencySymbol: "د.إ", visaRequired: true, visaType: "on-arrival", visaNote: "14-day visa on arrival", adapterType: "Type G", insuranceRecommended: true },
  { name: "Zurich", country: "Switzerland", isInternational: true, dailyCostBudget: 10000, dailyCostModerate: 25000, dailyCostLuxury: 60000, currency: "CHF", currencySymbol: "CHF", visaRequired: true, visaType: "embassy", visaNote: "Schengen visa required", adapterType: "Type C/J", insuranceRecommended: true },
  { name: "Swiss Alps", country: "Switzerland", isInternational: true, dailyCostBudget: 10000, dailyCostModerate: 25000, dailyCostLuxury: 60000, currency: "CHF", currencySymbol: "CHF", visaRequired: true, visaType: "embassy", visaNote: "Schengen visa required", adapterType: "Type C/J", insuranceRecommended: true },
  { name: "Santorini", country: "Greece", isInternational: true, dailyCostBudget: 5000, dailyCostModerate: 14000, dailyCostLuxury: 40000, currency: "EUR", currencySymbol: "€", visaRequired: true, visaType: "embassy", visaNote: "Schengen visa required", adapterType: "Type C/F", insuranceRecommended: true },
  { name: "Kuala Lumpur", country: "Malaysia", isInternational: true, dailyCostBudget: 2500, dailyCostModerate: 6000, dailyCostLuxury: 18000, currency: "MYR", currencySymbol: "RM", visaRequired: true, visaType: "e-visa", visaNote: "eNTRI or e-visa available", adapterType: "Type G", insuranceRecommended: true },
  { name: "Colombo", country: "Sri Lanka", isInternational: true, dailyCostBudget: 2000, dailyCostModerate: 5000, dailyCostLuxury: 15000, currency: "LKR", currencySymbol: "Rs", visaRequired: true, visaType: "e-visa", visaNote: "ETA required — apply online", adapterType: "Type D/G", insuranceRecommended: true },
  { name: "Kathmandu", country: "Nepal", isInternational: true, dailyCostBudget: 1500, dailyCostModerate: 3500, dailyCostLuxury: 10000, currency: "NPR", currencySymbol: "रू", visaRequired: false, visaType: "not-required", visaNote: "No visa required for Indian citizens", adapterType: "Type C/D/M", insuranceRecommended: true },
];

/**
 * Fuzzy-match a user-typed destination to our data.
 * Returns the best match or null if nothing close enough.
 */
export function findDestinationInfo(query: string): DestinationInfo | null {
  if (!query || query.trim().length < 2) return null;

  const q = query.toLowerCase().trim();

  // Exact match first
  const exact = DESTINATIONS.find((d) => d.name.toLowerCase() === q);
  if (exact) return exact;

  // Partial match (query contains destination name or vice versa)
  const partial = DESTINATIONS.find(
    (d) => q.includes(d.name.toLowerCase()) || d.name.toLowerCase().includes(q)
  );
  if (partial) return partial;

  // Country match
  const countryMatch = DESTINATIONS.find(
    (d) => d.country.toLowerCase() === q || q.includes(d.country.toLowerCase())
  );
  if (countryMatch) return countryMatch;

  return null;
}

/**
 * Format a budget range string.
 */
export function formatBudgetRange(
  info: DestinationInfo,
  days: number
): { perDay: string; total: string; budgetTotal: number; moderateTotal: number; luxuryTotal: number } {
  const budgetTotal = info.dailyCostBudget * days;
  const moderateTotal = info.dailyCostModerate * days;
  const luxuryTotal = info.dailyCostLuxury * days;

  const formatINR = (n: number) => {
    if (n >= 100000) return `₹${(n / 100000).toFixed(1)}L`;
    if (n >= 1000) return `₹${(n / 1000).toFixed(0)}K`;
    return `₹${n.toLocaleString("en-IN")}`;
  };

  return {
    perDay: `₹${info.dailyCostBudget.toLocaleString("en-IN")}–₹${info.dailyCostLuxury.toLocaleString("en-IN")}`,
    total: `${formatINR(budgetTotal)}–${formatINR(luxuryTotal)}`,
    budgetTotal,
    moderateTotal,
    luxuryTotal,
  };
}

/**
 * Check if two queries/cities belong to the same state.
 */
export function areCitiesInSameState(city1: string, city2: string): boolean {
  if (!city1 || !city2) return false;
  
  const dest1 = findDestinationInfo(city1);
  const dest2 = findDestinationInfo(city2);

  // If we can resolve both to destinations in our database, check their state
  if (dest1 && dest2 && dest1.state && dest2.state) {
    return dest1.state === dest2.state;
  }

  // Fallback: Check if they are just literally the same string or contain each other
  if (city1.toLowerCase().includes(city2.toLowerCase()) || city2.toLowerCase().includes(city1.toLowerCase())) {
    return true;
  }
  
  return false;
}
