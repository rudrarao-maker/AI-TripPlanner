import { NextResponse } from "next/server";
import { format } from "date-fns";

const getWeatherCondition = (code: number) => {
  if (code === 0) return { condition: "Clear", icon: "☀️" };
  if (code === 1) return { condition: "Mainly Clear", icon: "🌤️" };
  if (code === 2) return { condition: "Partly Cloudy", icon: "⛅" };
  if (code === 3) return { condition: "Overcast", icon: "☁️" };
  if (code === 45 || code === 48) return { condition: "Fog", icon: "🌫️" };
  if (code >= 51 && code <= 57) return { condition: "Drizzle", icon: "🌧️" };
  if (code >= 61 && code <= 67) return { condition: "Rain", icon: "🌧️" };
  if (code >= 71 && code <= 77) return { condition: "Snow", icon: "❄️" };
  if (code >= 80 && code <= 82) return { condition: "Showers", icon: "🌦️" };
  if (code >= 85 && code <= 86) return { condition: "Snow Showers", icon: "🌨️" };
  if (code >= 95 && code <= 99) return { condition: "Thunderstorm", icon: "⛈️" };
  return { condition: "Unknown", icon: "❓" };
};

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const lat = searchParams.get("lat");
    const lng = searchParams.get("lng");
    const location = searchParams.get("location") || "Destination";

    if (!lat || !lng) {
      return NextResponse.json({ error: "Latitude and Longitude are required" }, { status: 400 });
    }

    const openMeteoUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,cloud_cover,surface_pressure,wind_speed_10m,wind_direction_10m&daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,uv_index_max,precipitation_probability_max,wind_speed_10m_max&timezone=auto`;

    const response = await fetch(openMeteoUrl);
    if (!response.ok) {
      throw new Error("Failed to fetch weather data from Open-Meteo");
    }

    const data = await response.json();
    const currentCode = data.current.weather_code;
    const currentCondition = getWeatherCondition(currentCode);
    
    // Parse times safely
    const sunriseStr = data.daily.sunrise[0];
    const sunsetStr = data.daily.sunset[0];
    const sunrise = sunriseStr ? format(new Date(sunriseStr), "h:mm a") : "N/A";
    const sunset = sunsetStr ? format(new Date(sunsetStr), "h:mm a") : "N/A";

    const weatherData = {
      current: {
        location: location,
        temperature: Math.round(data.current.temperature_2m),
        feelsLike: Math.round(data.current.apparent_temperature),
        tempMin: Math.round(data.daily.temperature_2m_min[0]),
        tempMax: Math.round(data.daily.temperature_2m_max[0]),
        condition: currentCondition.condition,
        conditionIcon: currentCondition.icon,
        humidity: data.current.relative_humidity_2m,
        windSpeed: Math.round(data.current.wind_speed_10m),
        windDirection: "N/A", // Can be calculated from degrees if needed
        pressure: data.current.surface_pressure,
        visibility: 10, // Default since OpenMeteo doesn't always provide it in basic tier
        uvIndex: data.daily.uv_index_max[0] || 0,
        rainChance: data.daily.precipitation_probability_max[0] || 0,
        cloudCover: data.current.cloud_cover,
        sunrise: sunrise,
        sunset: sunset,
        updatedAt: new Date().toISOString(),
      },
      forecast: data.daily.time.slice(1, 6).map((time: string, index: number) => {
        const idx = index + 1; // offset by 1 because 0 is today
        const condition = getWeatherCondition(data.daily.weather_code[idx]);
        return {
          date: time,
          dayName: format(new Date(time), "EEEE"),
          tempHigh: Math.round(data.daily.temperature_2m_max[idx]),
          tempLow: Math.round(data.daily.temperature_2m_min[idx]),
          condition: condition.condition,
          conditionIcon: condition.icon,
          rainChance: data.daily.precipitation_probability_max[idx] || 0,
          humidity: 0, // Daily humidity not easily available in free tier
          windSpeed: Math.round(data.daily.wind_speed_10m_max[idx]),
          description: condition.condition,
        };
      }),
      alerts: [] // Assuming no alerts for open meteo free tier
    };

    return NextResponse.json({ success: true, data: weatherData });
  } catch (error: any) {
    console.error("Weather API Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
