"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { Clock, User, ChevronRight, Search, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { BLOG_CATEGORIES, BLOG_POSTS } from "@/lib/constants";

export function TravelGuidesPage() {
  const [activeCategory, setActiveCategory] = useState("all");
  const [search, setSearch] = useState("");

  const filtered = BLOG_POSTS.filter((p) => {
    const matchesSearch = p.title.toLowerCase().includes(search.toLowerCase());
    const matchesCat =
      activeCategory === "all" || p.category === activeCategory;
    return matchesSearch && matchesCat;
  });

  // Featured post is the first one
  const featured = BLOG_POSTS[0];

  return (
    <div className="min-h-screen pb-20 animate-fade-in">
      {/* Hero */}
      <div className="relative bg-gradient-to-b from-blue-500/10 to-background pt-32 pb-16 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4"
          >
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 text-blue-600 text-sm font-bold">
              <BookOpen className="h-4 w-4" /> Travel Guides & Tips
            </span>
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="text-4xl md:text-6xl font-bold tracking-tight mb-4"
          >
            Travel Guides & Blog
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto"
          >
            Expert tips, city guides, and insider knowledge to make your trip
            unforgettable
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
              placeholder="Search guides and articles..."
              className="pl-12 py-6 text-lg rounded-2xl bg-card border-border/50 shadow-xl"
            />
          </motion.div>
        </div>
      </div>

      <div className="container mx-auto px-4 mt-8 space-y-12">
        {/* Category Tabs */}
        <div className="flex items-center gap-3 overflow-x-auto hide-scrollbar">
          <button
            onClick={() => setActiveCategory("all")}
            className={`px-5 py-2.5 rounded-full text-sm font-medium whitespace-nowrap transition-all ${activeCategory === "all" ? "bg-primary text-primary-foreground shadow-md" : "bg-card border border-border/50 text-muted-foreground hover:bg-muted"}`}
          >
            All Guides
          </button>
          {BLOG_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-5 py-2.5 rounded-full text-sm font-medium whitespace-nowrap transition-all flex items-center gap-2 ${activeCategory === cat.id ? "bg-primary text-primary-foreground shadow-md" : `${cat.color} border border-border/30 hover:opacity-80`}`}
            >
              <span>{cat.icon}</span> {cat.label}
            </button>
          ))}
        </div>

        {/* Featured Article */}
        {activeCategory === "all" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Card className="glass-card overflow-hidden group cursor-pointer">
              <div className="grid md:grid-cols-2 gap-0">
                <div className="relative h-64 md:h-auto overflow-hidden">
                  <img
                    src={featured.image}
                    alt={featured.title}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-black/30 to-transparent md:bg-none" />
                </div>
                <CardContent className="p-8 flex flex-col justify-center">
                  <span className="inline-flex w-fit items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold mb-4">
                    Featured Article
                  </span>
                  <h2 className="text-2xl md:text-3xl font-bold mb-3 group-hover:text-primary transition-colors">
                    {featured.title}
                  </h2>
                  <p className="text-muted-foreground mb-4 line-clamp-3">
                    {featured.excerpt}
                  </p>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground mb-6">
                    <span className="flex items-center gap-1.5">
                      <User className="h-4 w-4" /> {featured.author}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Clock className="h-4 w-4" /> {featured.readTime} read
                    </span>
                  </div>
                  <Button
                    variant="gradient"
                    className="w-fit rounded-full gap-2"
                  >
                    Read More <ChevronRight className="h-4 w-4" />
                  </Button>
                </CardContent>
              </div>
            </Card>
          </motion.div>
        )}

        {/* Article Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((post, index) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className="glass-card group cursor-pointer overflow-hidden h-full flex flex-col">
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={post.image}
                    alt={post.title}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                  <div className="absolute top-3 left-3">
                    {BLOG_CATEGORIES.find((c) => c.id === post.category) && (
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold ${BLOG_CATEGORIES.find((c) => c.id === post.category)?.color}`}
                      >
                        {
                          BLOG_CATEGORIES.find((c) => c.id === post.category)
                            ?.icon
                        }{" "}
                        {
                          BLOG_CATEGORIES.find((c) => c.id === post.category)
                            ?.label
                        }
                      </span>
                    )}
                  </div>
                </div>
                <CardContent className="p-5 flex flex-col flex-1">
                  <div className="text-xs text-primary font-bold mb-2">
                    {post.date}
                  </div>
                  <h3 className="font-bold text-lg mb-2 group-hover:text-primary transition-colors line-clamp-2">
                    {post.title}
                  </h3>
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-4 flex-1">
                    {post.excerpt}
                  </p>
                  <div className="flex items-center justify-between mt-auto pt-4 border-t border-border/30">
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <User className="h-3 w-3" /> {post.author}
                    </span>
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3 w-3" /> {post.readTime}
                    </span>
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
