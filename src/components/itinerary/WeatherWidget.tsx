"use client";

import { useEffect, useState } from "react";
import { Cloud, Sun, CloudRain, Snowflake, AlertCircle } from "lucide-react";

interface WeatherWidgetProps {
  destination: string;
}

export function WeatherWidget({ destination }: WeatherWidgetProps) {
  const [weather, setWeather] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchWeather() {
      if (!destination) return;
      setLoading(true);
      try {
        const geoRes = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(destination)}&count=1&language=en&format=json`);
        const geoData = await geoRes.json();
        
        if (geoData.results && geoData.results.length > 0) {
          const { latitude, longitude } = geoData.results[0];
          
          const weatherRes = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,is_day,precipitation,weather_code&timezone=auto`);
          const weatherData = await weatherRes.json();
          setWeather(weatherData.current);
        }
      } catch (error) {
        console.error("Failed to fetch weather", error);
      } finally {
        setLoading(false);
      }
    }
    fetchWeather();
  }, [destination]);

  if (loading) {
    return <div className="h-16 bg-muted/20 animate-pulse rounded-lg border border-border"></div>;
  }

  if (!weather) {
    return null;
  }

  const getWeatherIcon = (code: number) => {
    if (code <= 1) return <Sun className="w-8 h-8 text-yellow-500" />;
    if (code <= 3) return <Cloud className="w-8 h-8 text-gray-400" />;
    if (code <= 67) return <CloudRain className="w-8 h-8 text-blue-400" />;
    if (code <= 77) return <Snowflake className="w-8 h-8 text-blue-200" />;
    return <CloudRain className="w-8 h-8 text-blue-500" />;
  };

  const getWeatherText = (code: number) => {
    if (code === 0) return "Clear sky";
    if (code === 1 || code === 2 || code === 3) return "Partly cloudy";
    if (code >= 45 && code <= 48) return "Fog";
    if (code >= 51 && code <= 67) return "Rain";
    if (code >= 71 && code <= 77) return "Snow";
    if (code >= 95) return "Thunderstorm";
    return "Variable";
  };

  return (
    <div className="flex items-center space-x-4 p-4 rounded-xl border border-border bg-card/50 backdrop-blur-sm shadow-sm">
      <div className="p-2 bg-background rounded-full shadow-sm">
        {getWeatherIcon(weather.weather_code)}
      </div>
      <div>
        <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Current Weather in {destination.split(',')[0]}</p>
        <div className="flex items-baseline space-x-2">
          <h3 className="text-2xl font-bold">{Math.round(weather.temperature_2m)}°C</h3>
          <span className="text-sm font-medium text-muted-foreground">{getWeatherText(weather.weather_code)}</span>
        </div>
      </div>
    </div>
  );
}
