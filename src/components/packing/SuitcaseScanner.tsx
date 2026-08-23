"use client";

import React, { useRef, useState } from "react";
import { Camera, Upload, AlertCircle, CheckCircle2 } from "lucide-react";

interface SuitcaseScannerProps {
  destination: string;
  expectedWeather: string;
}

export default function SuitcaseScanner({ destination, expectedWeather }: SuitcaseScannerProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleImageCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64 = event.target?.result as string;
      setImagePreview(base64);
      analyzeImage(base64);
    };
    reader.readAsDataURL(file);
  };

  const analyzeImage = async (base64: string) => {
    setLoading(true);
    try {
      const res = await fetch("/api/ai/vision", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageBase64: base64.split(",")[1], // Remove data URL prefix
          destination,
          expectedWeather,
        }),
      });

      const data = await res.json();
      if (data.result) {
        setResult(data.result);
      }
    } catch (err) {
      console.error("Failed to analyze suitcase", err);
    }
    setLoading(false);
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 max-w-md w-full mx-auto">
      <div className="text-center mb-6">
        <h3 className="text-lg font-bold text-gray-900">AI Packing Assistant</h3>
        <p className="text-sm text-gray-500 mt-1">Scan your open suitcase to see what you missed for {destination}.</p>
      </div>

      {!imagePreview ? (
        <div 
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-gray-300 rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer hover:border-indigo-500 hover:bg-indigo-50 transition-colors h-48"
        >
          <Camera size={40} className="text-gray-400 mb-3" />
          <span className="text-sm font-medium text-gray-700">Tap to take a photo of your suitcase</span>
          <span className="text-xs text-gray-400 mt-1">or upload an image</span>
          <input 
            type="file" 
            accept="image/*" 
            capture="environment" 
            ref={fileInputRef}
            className="hidden" 
            onChange={handleImageCapture}
          />
        </div>
      ) : (
        <div className="space-y-4">
          <div className="relative rounded-xl overflow-hidden h-48 bg-gray-100 flex items-center justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={imagePreview} alt="Suitcase" className="max-h-full object-contain" />
            
            {loading && (
              <div className="absolute inset-0 bg-white/70 backdrop-blur-sm flex flex-col items-center justify-center">
                <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-2"></div>
                <p className="text-sm font-medium text-indigo-700">Analyzing your items...</p>
              </div>
            )}
          </div>

          {result && !loading && (
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
              <p className="text-sm text-gray-800 font-medium leading-relaxed italic mb-4">
                &ldquo;{result.feedbackMessage}&rdquo;
              </p>

              {result.missingItems && result.missingItems.length > 0 && (
                <div>
                  <h4 className="text-sm font-bold text-red-600 flex items-center gap-2 mb-2">
                    <AlertCircle size={16} /> Missing Items
                  </h4>
                  <ul className="space-y-2">
                    {result.missingItems.map((item: any, i: number) => (
                      <li key={i} className="text-xs flex flex-col gap-0.5 p-2 bg-white rounded-lg shadow-sm border border-red-100">
                        <span className="font-bold text-gray-900">{item.item}</span>
                        <span className="text-gray-500">{item.reason}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {result.identifiedItems && result.identifiedItems.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <h4 className="text-sm font-bold text-green-600 flex items-center gap-2 mb-2">
                    <CheckCircle2 size={16} /> Packed Items
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {result.identifiedItems.map((item: string, i: number) => (
                      <span key={i} className="px-2 py-1 bg-green-50 text-green-700 rounded-md text-xs font-medium border border-green-200">
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
          
          <button 
            onClick={() => {
              setImagePreview(null);
              setResult(null);
            }}
            className="w-full py-2 text-sm font-medium text-gray-500 hover:text-gray-900"
          >
            Scan Another Suitcase
          </button>
        </div>
      )}
    </div>
  );
}
