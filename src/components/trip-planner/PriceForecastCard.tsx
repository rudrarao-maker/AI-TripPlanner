"use client";

import React, { useEffect, useState } from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { getPriceForecast, PriceForecast } from "@/lib/api/flights";
import { TrendingDown, TrendingUp, Plane, Info } from "lucide-react";

interface PriceForecastCardProps {
  origin: string;
  destination: string;
  date: string;
}

export default function PriceForecastCard({ origin, destination, date }: PriceForecastCardProps) {
  const [data, setData] = useState<PriceForecast | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchForecast = async () => {
      setLoading(true);
      try {
        const forecast = await getPriceForecast(origin, destination, date);
        setData(forecast);
      } catch (error) {
        console.error("Failed to fetch price forecast", error);
      }
      setLoading(false);
    };

    fetchForecast();
  }, [origin, destination, date]);

  if (loading) {
    return <div className="h-48 w-full bg-gray-100 animate-pulse rounded-xl" />;
  }

  if (!data) return null;

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h3 className="text-lg font-bold text-gray-900">Price Forecast</h3>
          <p className="text-sm text-gray-500">
            {origin} to {destination}
          </p>
        </div>
        <div className={`px-3 py-1 rounded-full text-sm font-bold flex items-center gap-1 ${data.prediction === 'WAIT' ? 'bg-orange-100 text-orange-700' : 'bg-green-100 text-green-700'}`}>
          {data.prediction === 'WAIT' ? (
            <>
              <TrendingDown size={16} /> Wait
            </>
          ) : (
            <>
              <TrendingUp size={16} /> Buy Now
            </>
          )}
        </div>
      </div>

      {data.prediction === 'WAIT' && data.expectedDrop && (
        <div className="bg-orange-50 p-4 rounded-xl mb-6 flex items-start gap-3">
          <Info className="text-orange-500 shrink-0 mt-0.5" size={20} />
          <div>
            <p className="text-sm text-orange-800 font-medium">Prices are expected to drop!</p>
            <p className="text-xs text-orange-700 mt-1">Based on historical trends, wait a few weeks to book. You could save around ${data.expectedDrop}.</p>
          </div>
        </div>
      )}

      <div className="h-40 w-full mb-6">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data.trendData}>
            <defs>
              <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
            <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9ca3af' }} />
            <YAxis domain={['dataMin - 50', 'dataMax + 50']} axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9ca3af' }} width={40} />
            <Tooltip 
              contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              formatter={(value: any) => [`$${value}`, 'Price']}
            />
            <Area type="monotone" dataKey="price" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorPrice)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {data.alternativeAirport && (
        <div className="border-t border-gray-100 pt-4 mt-4">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-100 p-2 rounded-lg text-indigo-600">
              <Plane size={20} />
            </div>
            <div>
              <h4 className="text-sm font-bold text-gray-900">Alternative Airport Savings</h4>
              <p className="text-xs text-gray-500 mt-0.5">
                Fly into {data.alternativeAirport.code} and save ${data.alternativeAirport.savings}. 
                Adds {data.alternativeAirport.extraTransitTimeMinutes}m transit time.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
