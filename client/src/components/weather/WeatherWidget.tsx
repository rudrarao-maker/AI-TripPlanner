import { Card, CardContent } from "@/components/ui/card";
import {
  Wind,
  Thermometer,
  Droplets,
  Eye,
  Sunrise,
  Sunset,
  CloudRain,
  AlertTriangle,
  Info,
  ShieldAlert,
} from "lucide-react";
import { useWeather } from "@/hooks/useWeather";
import type { WeatherData } from "@/hooks/useWeather";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";

interface WeatherWidgetProps {
  lat?: number;
  lng?: number;
  location?: string;
  compact?: boolean;
}

// Skeleton loader for weather widget
function WeatherSkeleton() {
  return (
    <Card className="glass-card overflow-hidden">
      <CardContent className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="flex justify-between">
            <div className="space-y-2">
              <div className="h-4 w-24 bg-muted rounded" />
              <div className="h-3 w-16 bg-muted rounded" />
            </div>
            <div className="h-12 w-20 bg-muted rounded" />
          </div>
          <div className="flex gap-4 pt-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex-1 h-8 bg-muted rounded" />
            ))}
          </div>
          <div className="grid grid-cols-5 gap-2 pt-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-20 bg-muted rounded-lg" />
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Alert severity badge
function AlertBadge({
  alert,
}: {
  alert: { severity: string; title: string; description: string };
}) {
  const colors = {
    info: "bg-blue-500/10 border-blue-500/20 text-blue-700 dark:text-blue-400",
    warning:
      "bg-amber-500/10 border-amber-500/20 text-amber-700 dark:text-amber-400",
    danger: "bg-red-500/10 border-red-500/20 text-red-700 dark:text-red-400",
  };

  const icons = {
    info: <Info className="h-4 w-4 shrink-0" />,
    warning: <AlertTriangle className="h-4 w-4 shrink-0" />,
    danger: <ShieldAlert className="h-4 w-4 shrink-0" />,
  };

  const severity = alert.severity as keyof typeof colors;

  return (
    <div
      className={`flex gap-3 p-3 rounded-xl border ${colors[severity]} text-sm`}
    >
      {icons[severity]}
      <div>
        <p className="font-semibold text-xs">{alert.title}</p>
        <p className="text-xs opacity-80 mt-0.5">{alert.description}</p>
      </div>
    </div>
  );
}

// Weather condition background gradient
function getWeatherGradient(condition: string): string {
  const gradients: Record<string, string> = {
    Clear: "from-orange-400/20 via-yellow-300/15 to-sky-400/20",
    Clouds: "from-slate-400/15 via-gray-300/15 to-blue-300/15",
    Rain: "from-blue-500/20 via-slate-400/15 to-indigo-400/15",
    Drizzle: "from-blue-400/15 via-gray-300/10 to-slate-400/15",
    Thunderstorm: "from-purple-600/20 via-slate-500/15 to-indigo-500/15",
    Snow: "from-blue-100/20 via-white/15 to-slate-200/20",
    Mist: "from-gray-300/15 to-gray-400/15",
  };
  return gradients[condition] || gradients["Clear"];
}

export function WeatherWidget({
  lat,
  lng,
  location,
  compact = false,
}: WeatherWidgetProps) {
  const { data: weather, isLoading, error } = useWeather(lat, lng, location);
  const [showAlerts, setShowAlerts] = useState(true);

  if (isLoading) return <WeatherSkeleton />;
  if (error || !weather) return null;

  const { current, forecast, alerts } = weather;

  if (compact) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3 px-4 py-2 rounded-xl glass text-sm"
      >
        <span className="text-2xl">{current.conditionIcon}</span>
        <div>
          <span className="font-bold text-lg">{current.temperature}°C</span>
          <span className="text-muted-foreground ml-2">
            {current.condition}
          </span>
        </div>
        {current.rainChance > 30 && (
          <span className="flex items-center gap-1 text-blue-500 text-xs font-medium ml-auto">
            <CloudRain className="h-3.5 w-3.5" /> {current.rainChance}%
          </span>
        )}
      </motion.div>
    );
  }

  return (
    <Card className="glass-card overflow-hidden relative group">
      {/* Dynamic gradient background */}
      <div
        className={`absolute inset-0 z-0 transition-opacity duration-1000 bg-gradient-to-br ${getWeatherGradient(current.condition)}`}
      />

      {/* Floating weather icon */}
      <div className="absolute -right-6 -top-6 opacity-[0.08] group-hover:opacity-[0.15] transition-opacity duration-700 pointer-events-none">
        <span className="text-[160px] block leading-none">
          {current.conditionIcon}
        </span>
      </div>

      <CardContent className="p-6 relative z-10">
        {/* Header: Location + Temperature */}
        <div className="flex justify-between items-start mb-1">
          <div>
            <h3 className="font-bold text-lg text-foreground">
              {current.location || location}
            </h3>
            <p className="text-sm text-muted-foreground flex items-center gap-1.5">
              <span className="text-lg">{current.conditionIcon}</span>
              {current.condition}
            </p>
          </div>
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="flex flex-col items-end"
          >
            <div className="flex items-start">
              <span className="text-5xl font-bold tracking-tighter text-foreground">
                {current.temperature}
              </span>
              <span className="text-xl font-semibold mt-1 text-muted-foreground">
                °C
              </span>
            </div>
            <span className="text-xs text-muted-foreground mt-0.5">
              H: {current.tempMax}° L: {current.tempMin}°
            </span>
          </motion.div>
        </div>

        {/* Stats Row */}
        <div className="flex items-center justify-between mt-5 gap-2">
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <Thermometer className="h-4 w-4 text-orange-500" />
            <span>Feels {current.feelsLike}°</span>
          </div>
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <Droplets className="h-4 w-4 text-blue-500" />
            <span>{current.humidity}%</span>
          </div>
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <Wind className="h-4 w-4 text-teal-500" />
            <span>{current.windSpeed} km/h</span>
          </div>
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <Eye className="h-4 w-4 text-indigo-500" />
            <span>{current.visibility} km</span>
          </div>
        </div>

        {/* Sunrise / Sunset */}
        <div className="flex items-center gap-6 mt-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <Sunrise className="h-3.5 w-3.5 text-amber-500" />
            <span>{current.sunrise}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Sunset className="h-3.5 w-3.5 text-orange-500" />
            <span>{current.sunset}</span>
          </div>
          {current.uvIndex > 0 && (
            <div
              className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                current.uvIndex >= 8
                  ? "bg-red-500/15 text-red-600 dark:text-red-400"
                  : current.uvIndex >= 5
                    ? "bg-amber-500/15 text-amber-600 dark:text-amber-400"
                    : "bg-green-500/15 text-green-600 dark:text-green-400"
              }`}
            >
              UV {current.uvIndex}
            </div>
          )}
        </div>

        {/* 5-Day Forecast */}
        {forecast.length > 0 && (
          <div className="mt-6 pt-4 border-t border-border/50">
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">
              5-Day Forecast
            </h4>
            <div className="grid grid-cols-5 gap-2">
              {forecast.map((day, i) => (
                <motion.div
                  key={day.date}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08 }}
                  className="flex flex-col items-center gap-1 p-2.5 rounded-xl bg-background/50 hover:bg-background/80 transition-colors border border-transparent hover:border-border/50"
                >
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                    {day.dayName.slice(0, 3)}
                  </span>
                  <span className="text-xl my-0.5">{day.conditionIcon}</span>
                  <div className="text-xs font-semibold text-foreground">
                    {day.tempHigh}°
                  </div>
                  <div className="text-[10px] text-muted-foreground">
                    {day.tempLow}°
                  </div>
                  {day.rainChance > 30 && (
                    <span className="text-[9px] text-blue-500 font-bold flex items-center gap-0.5">
                      <Droplets className="h-2.5 w-2.5" />
                      {day.rainChance}%
                    </span>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Weather Alerts */}
        <AnimatePresence>
          {showAlerts && alerts.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 space-y-2 overflow-hidden"
            >
              {alerts.map((alert, i) => (
                <AlertBadge key={i} alert={alert} />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}
