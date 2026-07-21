import dotenv from 'dotenv';
dotenv.config();

interface CurrentWeather {
  location: string;
  temperature: number;
  feelsLike: number;
  tempMin: number;
  tempMax: number;
  condition: string;
  conditionIcon: string;
  humidity: number;
  windSpeed: number;
  windDirection: string;
  pressure: number;
  visibility: number;
  uvIndex: number;
  rainChance: number;
  cloudCover: number;
  sunrise: string;
  sunset: string;
  updatedAt: string;
}

interface ForecastDay {
  date: string;
  dayName: string;
  tempHigh: number;
  tempLow: number;
  condition: string;
  conditionIcon: string;
  rainChance: number;
  humidity: number;
  windSpeed: number;
  description: string;
}

interface WeatherResponse {
  current: CurrentWeather;
  forecast: ForecastDay[];
  alerts: WeatherAlert[];
}

interface WeatherAlert {
  severity: 'info' | 'warning' | 'danger';
  title: string;
  description: string;
}

const OPENWEATHER_API_KEY = process.env.OPENWEATHER_API_KEY;
const BASE_URL = 'https://api.openweathermap.org/data/2.5';

// Weather condition to icon mapping
const CONDITION_ICONS: Record<string, string> = {
  'Clear': '☀️',
  'Clouds': '☁️',
  'Few clouds': '⛅',
  'Scattered clouds': '🌤️',
  'Broken clouds': '☁️',
  'Overcast clouds': '☁️',
  'Rain': '🌧️',
  'Drizzle': '🌦️',
  'Thunderstorm': '⛈️',
  'Snow': '❄️',
  'Mist': '🌫️',
  'Fog': '🌫️',
  'Haze': '🌫️',
  'Smoke': '🌫️',
};

function getConditionIcon(condition: string): string {
  return CONDITION_ICONS[condition] || '🌤️';
}

function getDayName(date: Date): string {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return days[date.getDay()];
}

function windDegreesToDirection(deg: number): string {
  const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
  return directions[Math.round(deg / 22.5) % 16];
}

// Generate smart weather alerts based on conditions
function generateAlerts(current: CurrentWeather, forecast: ForecastDay[]): WeatherAlert[] {
  const alerts: WeatherAlert[] = [];

  if (current.temperature > 38) {
    alerts.push({ severity: 'danger', title: 'Extreme Heat Warning', description: `Temperature is ${current.temperature}°C. Stay hydrated and avoid prolonged sun exposure.` });
  } else if (current.temperature > 35) {
    alerts.push({ severity: 'warning', title: 'Heat Advisory', description: `High temperature of ${current.temperature}°C expected. Carry water and sunscreen.` });
  }

  if (current.uvIndex >= 8) {
    alerts.push({ severity: 'warning', title: 'High UV Index', description: `UV Index is ${current.uvIndex}. Apply SPF 50+ sunscreen and wear protective clothing.` });
  }

  const rainyDays = forecast.filter(d => d.rainChance > 60);
  if (rainyDays.length >= 3) {
    alerts.push({ severity: 'info', title: 'Rain Expected', description: `Rain is likely on ${rainyDays.length} of the next ${forecast.length} days. Pack an umbrella and waterproof gear.` });
  }

  if (current.windSpeed > 40) {
    alerts.push({ severity: 'warning', title: 'Strong Wind Advisory', description: `Wind speeds of ${current.windSpeed} km/h. Outdoor activities may be affected.` });
  }

  if (current.temperature < 5) {
    alerts.push({ severity: 'warning', title: 'Cold Weather Alert', description: `Temperature is ${current.temperature}°C. Bundle up with warm layers.` });
  }

  return alerts;
}

// ===== Real OpenWeatherMap API =====
async function fetchRealWeather(lat: number, lng: number): Promise<WeatherResponse> {
  const currentUrl = `${BASE_URL}/weather?lat=${lat}&lon=${lng}&appid=${OPENWEATHER_API_KEY}&units=metric`;
  const forecastUrl = `${BASE_URL}/forecast?lat=${lat}&lon=${lng}&appid=${OPENWEATHER_API_KEY}&units=metric`;

  const [currentRes, forecastRes] = await Promise.all([
    fetch(currentUrl),
    fetch(forecastUrl),
  ]);

  if (!currentRes.ok || !forecastRes.ok) {
    throw new Error('Failed to fetch weather data from OpenWeatherMap');
  }

  const currentData = await currentRes.json();
  const forecastData = await forecastRes.json();

  const current: CurrentWeather = {
    location: currentData.name || 'Unknown Location',
    temperature: Math.round(currentData.main.temp),
    feelsLike: Math.round(currentData.main.feels_like),
    tempMin: Math.round(currentData.main.temp_min),
    tempMax: Math.round(currentData.main.temp_max),
    condition: currentData.weather[0].main,
    conditionIcon: getConditionIcon(currentData.weather[0].main),
    humidity: currentData.main.humidity,
    windSpeed: Math.round(currentData.wind.speed * 3.6), // m/s → km/h
    windDirection: windDegreesToDirection(currentData.wind.deg || 0),
    pressure: currentData.main.pressure,
    visibility: Math.round((currentData.visibility || 10000) / 1000), // meters → km
    uvIndex: 0, // OpenWeatherMap free tier doesn't include UV — set from separate call or estimate
    rainChance: currentData.clouds?.all || 0,
    cloudCover: currentData.clouds?.all || 0,
    sunrise: new Date(currentData.sys.sunrise * 1000).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
    sunset: new Date(currentData.sys.sunset * 1000).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
    updatedAt: new Date().toISOString(),
  };

  // Aggregate forecast into daily buckets
  const dailyMap = new Map<string, any[]>();
  for (const item of forecastData.list) {
    const dateKey = item.dt_txt.split(' ')[0];
    if (!dailyMap.has(dateKey)) dailyMap.set(dateKey, []);
    dailyMap.get(dateKey)!.push(item);
  }

  const forecast: ForecastDay[] = [];
  for (const [dateStr, items] of dailyMap) {
    if (forecast.length >= 5) break;

    const date = new Date(dateStr);
    const temps = items.map((i: any) => i.main.temp);
    const pops = items.map((i: any) => (i.pop || 0) * 100);
    const humidities = items.map((i: any) => i.main.humidity);
    const winds = items.map((i: any) => i.wind.speed * 3.6);
    // Pick the most common weather condition
    const conditions = items.map((i: any) => i.weather[0].main);
    const conditionCount = conditions.reduce((acc: Record<string, number>, c: string) => { acc[c] = (acc[c] || 0) + 1; return acc; }, {});
    const mainCondition = Object.entries(conditionCount).sort(([, a], [, b]) => (b as number) - (a as number))[0][0];
    const description = items.find((i: any) => i.weather[0].main === mainCondition)?.weather[0].description || mainCondition;

    forecast.push({
      date: dateStr,
      dayName: getDayName(date),
      tempHigh: Math.round(Math.max(...temps)),
      tempLow: Math.round(Math.min(...temps)),
      condition: mainCondition,
      conditionIcon: getConditionIcon(mainCondition),
      rainChance: Math.round(Math.max(...pops)),
      humidity: Math.round(humidities.reduce((a: number, b: number) => a + b, 0) / humidities.length),
      windSpeed: Math.round(Math.max(...winds)),
      description: description.charAt(0).toUpperCase() + description.slice(1),
    });
  }

  const alerts = generateAlerts(current, forecast);

  return { current, forecast, alerts };
}

// ===== Intelligent Mock Fallback =====
function generateMockWeather(lat: number, lng: number, locationName?: string): WeatherResponse {
  // Estimate climate zone from latitude
  const absLat = Math.abs(lat);
  const month = new Date().getMonth(); // 0-11
  const isSummer = (lat >= 0 && month >= 4 && month <= 8) || (lat < 0 && (month <= 2 || month >= 10));
  const isTropical = absLat < 23.5;
  const isSubtropical = absLat >= 23.5 && absLat < 35;
  const isTemperate = absLat >= 35 && absLat < 55;

  let baseTemp: number;
  let condition: string;
  let rainChance: number;
  let humidity: number;

  if (isTropical) {
    baseTemp = isSummer ? 32 : 28;
    condition = Math.random() > 0.4 ? 'Clear' : 'Rain';
    rainChance = 40 + Math.floor(Math.random() * 30);
    humidity = 70 + Math.floor(Math.random() * 15);
  } else if (isSubtropical) {
    baseTemp = isSummer ? 35 : 20;
    condition = isSummer ? 'Clear' : (Math.random() > 0.5 ? 'Clouds' : 'Clear');
    rainChance = isSummer ? 15 : 35;
    humidity = 50 + Math.floor(Math.random() * 20);
  } else if (isTemperate) {
    baseTemp = isSummer ? 25 : 8;
    condition = Math.random() > 0.5 ? 'Clouds' : 'Clear';
    rainChance = 25 + Math.floor(Math.random() * 25);
    humidity = 55 + Math.floor(Math.random() * 20);
  } else {
    baseTemp = isSummer ? 15 : -5;
    condition = isSummer ? 'Clouds' : 'Snow';
    rainChance = 30;
    humidity = 60;
  }

  // Add some randomness
  const tempVariation = Math.floor(Math.random() * 5) - 2;
  const temp = baseTemp + tempVariation;

  const current: CurrentWeather = {
    location: locationName || `${lat.toFixed(2)}°, ${lng.toFixed(2)}°`,
    temperature: temp,
    feelsLike: temp + (humidity > 70 ? 3 : -1),
    tempMin: temp - 3,
    tempMax: temp + 4,
    condition,
    conditionIcon: getConditionIcon(condition),
    humidity,
    windSpeed: 8 + Math.floor(Math.random() * 20),
    windDirection: ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'][Math.floor(Math.random() * 8)],
    pressure: 1010 + Math.floor(Math.random() * 15),
    visibility: 8 + Math.floor(Math.random() * 7),
    uvIndex: isTropical ? 8 + Math.floor(Math.random() * 4) : (isSummer ? 5 + Math.floor(Math.random() * 4) : 2 + Math.floor(Math.random() * 3)),
    rainChance,
    cloudCover: condition === 'Clear' ? 10 : 50 + Math.floor(Math.random() * 40),
    sunrise: '06:15 AM',
    sunset: '06:45 PM',
    updatedAt: new Date().toISOString(),
  };

  const conditions = ['Clear', 'Clouds', 'Rain', 'Clear', 'Clear', 'Clouds'];
  const forecast: ForecastDay[] = [];
  for (let i = 0; i < 5; i++) {
    const date = new Date();
    date.setDate(date.getDate() + i + 1);
    const dayCondition = conditions[Math.floor(Math.random() * conditions.length)];
    const dayTempHigh = temp + Math.floor(Math.random() * 5) - 1;
    const dayTempLow = dayTempHigh - 5 - Math.floor(Math.random() * 4);

    forecast.push({
      date: date.toISOString().split('T')[0],
      dayName: getDayName(date),
      tempHigh: dayTempHigh,
      tempLow: dayTempLow,
      condition: dayCondition,
      conditionIcon: getConditionIcon(dayCondition),
      rainChance: dayCondition === 'Rain' ? 60 + Math.floor(Math.random() * 30) : 5 + Math.floor(Math.random() * 20),
      humidity: humidity + Math.floor(Math.random() * 10) - 5,
      windSpeed: 5 + Math.floor(Math.random() * 15),
      description: dayCondition === 'Clear' ? 'Clear skies' : dayCondition === 'Rain' ? 'Light rain expected' : 'Partly cloudy',
    });
  }

  const alerts = generateAlerts(current, forecast);
  return { current, forecast, alerts };
}

// ===== Exported functions =====

export async function getCurrentWeather(lat: number, lng: number, locationName?: string): Promise<WeatherResponse> {
  if (OPENWEATHER_API_KEY && OPENWEATHER_API_KEY !== 'mock_key') {
    try {
      return await fetchRealWeather(lat, lng);
    } catch (err) {
      console.warn('OpenWeatherMap API failed, using mock fallback:', err);
    }
  }

  // Fallback to intelligent mock
  return generateMockWeather(lat, lng, locationName);
}
