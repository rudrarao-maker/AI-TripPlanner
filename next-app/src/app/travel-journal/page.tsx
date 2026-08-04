"use client";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  BookOpen,
  Camera,
  MapPin,
  Calendar as CalendarIcon,
  Download,
  Star,
} from "lucide-react";
import html2pdf from "html2pdf.js";

export function TravelJournalPage() {
  const [entries, setEntries] = useState([
    {
      id: 1,
      date: "2026-08-01",
      location: "Uluwatu Temple, Bali",
      notes:
        "The sunset was absolutely incredible. Watched the Kecak fire dance!",
      rating: 5,
      image:
        "https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?w=800",
    },
  ]);

  const [newEntry, setNewEntry] = useState({ location: "", notes: "" });

  const handleAddEntry = () => {
    if (!newEntry.location || !newEntry.notes) return;

    setEntries([
      {
        id: Date.now(),
        date: new Date().toISOString().split("T")[0],
        location: newEntry.location,
        notes: newEntry.notes,
        rating: 5,
        image:
          "https://images.unsplash.com/photo-1532185987396-d8f99e3a31c5?w=800", // mock image for now
      },
      ...entries,
    ]);
    setNewEntry({ location: "", notes: "" });
  };

  const handleDownloadPdf = () => {
    const element = document.getElementById("journal-content");
    if (!element) return;

    const opt = {
      margin: 10,
      filename: `My-Travel-Journal.pdf`,
      image: { type: "jpeg" as const, quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: "mm", format: "a4", orientation: "portrait" as const },
    };

    html2pdf().set(opt).from(element).save();
  };

  return (
    <div className="container mx-auto px-4 py-8 mt-20 animate-fade-in max-w-4xl">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <BookOpen className="h-8 w-8 text-primary" />
            Travel Journal
          </h1>
          <p className="text-muted-foreground mt-1">
            Record your memories, rate places, and export them as a beautiful
            PDF.
          </p>
        </div>
        <Button variant="outline" className="gap-2" onClick={handleDownloadPdf}>
          <Download className="h-4 w-4" /> Export PDF
        </Button>
      </div>

      {/* New Entry Form */}
      <Card className="glass-card mb-8">
        <CardHeader>
          <CardTitle className="text-lg">New Memory</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Location</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  className="pl-9 bg-background/50"
                  placeholder="Where are you?"
                  value={newEntry.location}
                  onChange={(e) =>
                    setNewEntry({ ...newEntry, location: e.target.value })
                  }
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Photo</label>
              <Button
                variant="outline"
                className="w-full justify-start text-muted-foreground bg-background/50"
              >
                <Camera className="mr-2 h-4 w-4" /> Upload Photo...
              </Button>
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Notes</label>
            <Textarea
              placeholder="What did you do? How was it?"
              className="min-h-[100px] bg-background/50"
              value={newEntry.notes}
              onChange={(e) =>
                setNewEntry({ ...newEntry, notes: e.target.value })
              }
            />
          </div>
          <Button
            variant="gradient"
            className="w-full sm:w-auto"
            onClick={handleAddEntry}
          >
            Save Memory
          </Button>
        </CardContent>
      </Card>

      {/* Journal Entries List (This gets exported) */}
      <div
        id="journal-content"
        className="space-y-8 bg-background p-4 rounded-xl"
      >
        {entries.map((entry) => (
          <Card key={entry.id} className="overflow-hidden border-border/50">
            <div className="flex flex-col md:flex-row">
              <div className="md:w-1/3 h-48 md:h-auto relative">
                <img
                  src={entry.image}
                  alt={entry.location}
                  className="absolute inset-0 w-full h-full object-cover"
                />
              </div>
              <div className="md:w-2/3 p-6 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-xl font-bold">{entry.location}</h3>
                    <div className="flex text-yellow-400">
                      {[...Array(entry.rating)].map((_, i) => (
                        <Star key={i} className="h-4 w-4 fill-current" />
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground mb-4">
                    <CalendarIcon className="h-3.5 w-3.5 mr-1" /> {entry.date}
                  </div>
                  <p className="text-foreground leading-relaxed">
                    "{entry.notes}"
                  </p>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
