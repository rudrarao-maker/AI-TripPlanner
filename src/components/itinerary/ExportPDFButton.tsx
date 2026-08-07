"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, Loader2 } from "lucide-react";

interface ExportPDFButtonProps {
  elementId: string;
  filename?: string;
}

export function ExportPDFButton({ elementId, filename = "trip-itinerary.pdf" }: ExportPDFButtonProps) {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    
    try {
      // Dynamic import because html2pdf depends on window/document (client-side only)
      const html2pdf = (await import("html2pdf.js")).default;
      
      const element = document.getElementById(elementId);
      if (!element) {
        throw new Error(`Element with id ${elementId} not found.`);
      }

      const opt = {
        margin:       1,
        filename:     filename,
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas:  { scale: 2, useCORS: true },
        jsPDF:        { unit: 'in', format: 'letter', orientation: 'portrait' }
      };

      await html2pdf().set(opt).from(element).save();
    } catch (error) {
      console.error("Export failed:", error);
      alert("Failed to export PDF. Please try again.");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Button 
      onClick={handleExport} 
      disabled={isExporting}
      variant="outline"
      className="gap-2 bg-background/50 backdrop-blur-sm border-primary/20 hover:bg-primary/10 transition-all"
    >
      {isExporting ? (
        <Loader2 className="h-4 w-4 animate-spin text-primary" />
      ) : (
        <Download className="h-4 w-4 text-primary" />
      )}
      {isExporting ? "Exporting..." : "Export PDF"}
    </Button>
  );
}
