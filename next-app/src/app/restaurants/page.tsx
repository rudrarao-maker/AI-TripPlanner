"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import {
  MapPin,
  Star,
  Clock,
  DollarSign,
  Search,
  Filter,
  UtensilsCrossed,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

const RESTAURANTS = [
  {
    id: "res1",
    name: "Indian Accent",
    cuisine: "Modern Indian",
    location: "New Delhi, India",
    image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600",
    rating: 4.9,
    reviews: 3200,
    priceRange: "₹₹₹₹",
    timing: "12:00 PM - 11:00 PM",
  },
  {
    id: "res2",
    name: "Karavalli",
    cuisine: "South Indian Coastal",
    location: "Bangalore, India",
    image: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600",
    rating: 4.8,
    reviews: 2100,
    priceRange: "₹₹₹",
    timing: "12:30 PM - 10:30 PM",
  },
  {
    id: "res3",
    name: "Bukhara",
    cuisine: "North Indian",
    location: "New Delhi, India",
    image: "https://images.unsplash.com/photo-1552566626-52f8b828add9?w=600",
    rating: 4.7,
    reviews: 4500,
    priceRange: "₹₹₹₹",
    timing: "12:00 PM - 11:30 PM",
  },
  {
    id: "res4",
    name: "The Table",
    cuisine: "European Fusion",
    location: "Mumbai, India",
    image: "https://images.unsplash.com/photo-1424847651672-bf20a4b0982b?w=600",
    rating: 4.6,
    reviews: 1800,
    priceRange: "₹₹₹",
    timing: "7:00 PM - 1:00 AM",
  },
  {
    id: "res5",
    name: "Wasabi by Morimoto",
    cuisine: "Japanese",
    location: "Mumbai, India",
    image: "https://images.unsplash.com/photo-1579027989536-b7b1f875659b?w=600",
    rating: 4.8,
    reviews: 2800,
    priceRange: "₹₹₹₹",
    timing: "12:00 PM - 3:00 PM, 7:00 PM - 11:30 PM",
  },
  {
    id: "res6",
    name: "Fisherman's Wharf",
    cuisine: "Goan Seafood",
    location: "Goa, India",
    image: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600",
    rating: 4.5,
    reviews: 3400,
    priceRange: "₹₹",
    timing: "11:00 AM - 11:00 PM",
  },
  {
    id: "res7",
    name: "SodaBottleOpenerWala",
    cuisine: "Parsi",
    location: "Mumbai, India",
    image: "https://images.unsplash.com/photo-1466978913421-dad2ebd01d17?w=600",
    rating: 4.4,
    reviews: 1600,
    priceRange: "₹₹",
    timing: "9:00 AM - 11:00 PM",
  },
  {
    id: "res8",
    name: "Dum Pukht",
    cuisine: "Awadhi",
    location: "New Delhi, India",
    image: "https://images.unsplash.com/photo-1590846406792-0adc7f938f1d?w=600",
    rating: 4.7,
    reviews: 2900,
    priceRange: "₹₹₹₹",
    timing: "12:30 PM - 2:45 PM, 7:30 PM - 11:45 PM",
  },
];

const CUISINE_FILTERS = [
  "All",
  "North Indian",
  "South Indian",
  "Japanese",
  "European",
  "Seafood",
  "Street Food",
];

export default function RestaurantsPage() {
  const [search, setSearch] = useState("");
  const [activeCuisine, setActiveCuisine] = useState("All");

  const filtered = RESTAURANTS.filter((r) => {
    const matchesSearch =
      r.name.toLowerCase().includes(search.toLowerCase()) ||
      r.cuisine.toLowerCase().includes(search.toLowerCase()) ||
      r.location.toLowerCase().includes(search.toLowerCase());
    const matchesCuisine =
      activeCuisine === "All" ||
      r.cuisine.toLowerCase().includes(activeCuisine.toLowerCase());
    return matchesSearch && matchesCuisine;
  });

  return (
    <div className="min-h-screen pb-20 animate-fade-in">
      {/* Hero */}
      <div className="relative bg-gradient-to-b from-orange-500/10 to-background pt-32 pb-16 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4"
          >
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-orange-500/10 text-orange-600 text-sm font-bold">
              <UtensilsCrossed className="h-4 w-4" /> Curated Dining
            </span>
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="text-4xl md:text-6xl font-bold tracking-tight mb-4"
          >
            Best Restaurants
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto"
          >
            Discover top-rated restaurants and hidden culinary gems
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="relative max-w-xl mx-auto"
          >
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search restaurants, cuisines, or cities..."
              className="pl-12 py-6 text-lg rounded-2xl bg-card border-border/50 shadow-xl"
            />
          </motion.div>
        </div>
      </div>

      <div className="container mx-auto px-4 mt-8 space-y-10">
        {/* Cuisine Filter */}
        <div className="flex items-center gap-2 overflow-x-auto hide-scrollbar pb-2">
          <Filter className="h-5 w-5 text-muted-foreground shrink-0" />
          {CUISINE_FILTERS.map((c) => (
            <button
              key={c}
              onClick={() => setActiveCuisine(c)}
              className={`px-5 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${activeCuisine === c ? "bg-orange-500 text-white shadow-md" : "bg-card border border-border/50 text-muted-foreground hover:bg-muted"}`}
            >
              {c}
            </button>
          ))}
        </div>

        {/* Restaurant Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filtered.map((rest, index) => (
            <motion.div
              key={rest.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className="glass-card group cursor-pointer overflow-hidden h-full flex flex-col">
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={rest.image}
                    alt={rest.name}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute top-3 right-3 bg-white/20 backdrop-blur-md px-2.5 py-1 rounded-full text-white text-xs font-bold flex items-center gap-1 border border-white/10">
                    <Star className="h-3 w-3 fill-amber-400 text-amber-400" />{" "}
                    {rest.rating}
                  </div>
                  <div className="absolute bottom-3 left-3 bg-black/50 backdrop-blur-md px-3 py-1 rounded-full text-white text-xs font-medium">
                    {rest.priceRange}
                  </div>
                </div>
                <CardContent className="p-5 flex flex-col flex-1">
                  <h3 className="font-bold text-lg mb-1 group-hover:text-orange-500 transition-colors">
                    {rest.name}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-1">
                    {rest.cuisine}
                  </p>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-2">
                    <MapPin className="h-3 w-3" /> {rest.location}
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-4">
                    <Clock className="h-3 w-3" /> {rest.timing}
                  </div>
                  <div className="mt-auto flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">
                      {rest.reviews.toLocaleString()} reviews
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-full text-xs group-hover:bg-orange-500 group-hover:text-white group-hover:border-orange-500 transition-all"
                    >
                      View Menu
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
