import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Heart,
  MapPin,
  Star,
  Trash2,
  ExternalLink,
  Filter,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";

interface WishlistItem {
  id: string;
  type: "destination" | "hotel" | "restaurant" | "activity";
  name: string;
  location: string;
  image: string;
  rating: number;
  addedOn: string;
}

const INITIAL_WISHLIST: WishlistItem[] = [
  {
    id: "w1",
    type: "destination",
    name: "Santorini",
    location: "Greece",
    image: "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=600",
    rating: 4.9,
    addedOn: "2 days ago",
  },
  {
    id: "w2",
    type: "hotel",
    name: "Taj Falaknuma Palace",
    location: "Hyderabad, India",
    image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600",
    rating: 4.8,
    addedOn: "1 week ago",
  },
  {
    id: "w3",
    type: "activity",
    name: "Hot Air Balloon Ride",
    location: "Cappadocia, Turkey",
    image: "https://images.unsplash.com/photo-1507608616759-54f48f0af0ee?w=600",
    rating: 4.9,
    addedOn: "3 days ago",
  },
  {
    id: "w4",
    type: "restaurant",
    name: "Noma",
    location: "Copenhagen, Denmark",
    image: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600",
    rating: 4.7,
    addedOn: "5 days ago",
  },
  {
    id: "w5",
    type: "destination",
    name: "Maldives",
    location: "Maldives",
    image: "https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=600",
    rating: 4.9,
    addedOn: "1 week ago",
  },
  {
    id: "w6",
    type: "activity",
    name: "Northern Lights Tour",
    location: "Tromsø, Norway",
    image: "https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=600",
    rating: 4.8,
    addedOn: "2 weeks ago",
  },
];

const TYPE_COLORS: Record<string, string> = {
  destination: "bg-blue-500/10 text-blue-600",
  hotel: "bg-purple-500/10 text-purple-600",
  restaurant: "bg-orange-500/10 text-orange-600",
  activity: "bg-emerald-500/10 text-emerald-600",
};

export function WishlistPage() {
  const navigate = useNavigate();
  const [items, setItems] = useState(INITIAL_WISHLIST);
  const [filter, setFilter] = useState("all");

  const filtered = items.filter((i) => filter === "all" || i.type === filter);

  const removeItem = (id: string) => {
    setItems(items.filter((i) => i.id !== id));
  };

  return (
    <div className="min-h-screen pb-20 animate-fade-in">
      {/* Hero */}
      <div className="bg-gradient-to-b from-rose-500/10 to-background pt-32 pb-16 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4"
          >
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-rose-500/10 text-rose-500 text-sm font-bold">
              <Heart className="h-4 w-4 fill-rose-500" /> Your Wishlist
            </span>
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="text-4xl md:text-5xl font-bold tracking-tight mb-4"
          >
            Saved Places & Experiences
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg text-muted-foreground max-w-xl mx-auto"
          >
            Your dream travel bucket list — {items.length} items saved
          </motion.p>
        </div>
      </div>

      <div className="container mx-auto px-4 mt-6 space-y-8 max-w-5xl">
        {/* Filter */}
        <div className="flex items-center gap-2 overflow-x-auto hide-scrollbar">
          <Filter className="h-5 w-5 text-muted-foreground shrink-0" />
          {["all", "destination", "hotel", "restaurant", "activity"].map(
            (f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-5 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all capitalize ${filter === f ? "bg-rose-500 text-white shadow-md" : "bg-card border border-border/50 text-muted-foreground hover:bg-muted"}`}
              >
                {f === "all" ? "All Items" : `${f}s`}
              </button>
            ),
          )}
        </div>

        {/* Wishlist Items */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {filtered.map((item, index) => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: index * 0.03 }}
              >
                <Card className="glass-card group cursor-pointer overflow-hidden h-full flex flex-col">
                  <div className="relative h-44 overflow-hidden">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute top-3 left-3">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold capitalize ${TYPE_COLORS[item.type]}`}
                      >
                        {item.type}
                      </span>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeItem(item.id);
                      }}
                      className="absolute top-3 right-3 bg-white/20 backdrop-blur-md p-2 rounded-full text-white hover:bg-red-500 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                    <div className="absolute bottom-3 right-3 bg-white/20 backdrop-blur-md px-2.5 py-1 rounded-full text-white text-xs font-bold flex items-center gap-1 border border-white/10">
                      <Star className="h-3 w-3 fill-amber-400 text-amber-400" />{" "}
                      {item.rating}
                    </div>
                  </div>
                  <CardContent className="p-5 flex flex-col flex-1">
                    <h3 className="font-bold text-lg mb-1 group-hover:text-rose-500 transition-colors">
                      {item.name}
                    </h3>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-3">
                      <MapPin className="h-3 w-3" /> {item.location}
                    </div>
                    <div className="mt-auto flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">
                        Added {item.addedOn}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        className="rounded-full text-xs gap-1 group-hover:bg-rose-500 group-hover:text-white group-hover:border-rose-500"
                      >
                        <ExternalLink className="h-3 w-3" /> View
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">💔</div>
            <h3 className="text-xl font-bold mb-2">
              No items in your wishlist
            </h3>
            <p className="text-muted-foreground mb-6">
              Start exploring and save places you love
            </p>
            <Button
              variant="gradient"
              className="rounded-full"
              onClick={() => navigate("/explore")}
            >
              Explore Destinations
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
