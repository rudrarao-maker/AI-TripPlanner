"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { Clock, User, ChevronRight, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { BLOG_CATEGORIES, BLOG_POSTS } from "@/lib/constants";

export function BlogPage() {
  const [activeCategory, setActiveCategory] = useState("all");
  const [search, setSearch] = useState("");

  const filtered = BLOG_POSTS.filter((p) => {
    const matchesSearch =
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.excerpt.toLowerCase().includes(search.toLowerCase());
    const matchesCat =
      activeCategory === "all" || p.category === activeCategory;
    return matchesSearch && matchesCat;
  });

  const featured = BLOG_POSTS[0];

  return (
    <div className="container mx-auto px-4 py-24 min-h-screen">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-5xl mx-auto space-y-8"
      >
        <div className="text-center space-y-4 mb-8">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
            Travel Blog
          </h1>
          <p className="text-xl text-muted-foreground">
            Insights, tips, and inspiration for your next adventure.
          </p>
        </div>

        {/* Search */}
        <div className="relative max-w-lg mx-auto mb-8">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search articles..."
            className="pl-12 py-5 rounded-2xl bg-card shadow-lg"
          />
        </div>

        {/* Category Tabs */}
        <div className="flex items-center gap-2 justify-center overflow-x-auto hide-scrollbar mb-8">
          <button
            onClick={() => setActiveCategory("all")}
            className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${activeCategory === "all" ? "bg-primary text-primary-foreground shadow-md" : "bg-card border border-border/50 text-muted-foreground hover:bg-muted"}`}
          >
            All Posts
          </button>
          {BLOG_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-5 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all flex items-center gap-1.5 ${activeCategory === cat.id ? "bg-primary text-primary-foreground shadow-md" : `${cat.color} border border-border/30`}`}
            >
              {cat.icon} {cat.label}
            </button>
          ))}
        </div>

        {/* Featured Article */}
        {activeCategory === "all" && !search && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Card className="glass-card overflow-hidden group cursor-pointer mb-8">
              <div className="grid md:grid-cols-2 gap-0">
                <div className="relative h-64 md:h-80 overflow-hidden">
                  <img
                    src={featured.image}
                    alt={featured.title}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                </div>
                <CardContent className="p-8 flex flex-col justify-center">
                  <span className="text-xs font-bold text-primary mb-3 uppercase tracking-wider">
                    Featured
                  </span>
                  <h2 className="text-2xl md:text-3xl font-bold mb-3 group-hover:text-primary transition-colors">
                    {featured.title}
                  </h2>
                  <p className="text-muted-foreground mb-4">
                    {featured.excerpt}
                  </p>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground mb-6">
                    <span className="flex items-center gap-1.5">
                      <User className="h-4 w-4" /> {featured.author}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Clock className="h-4 w-4" /> {featured.readTime} read
                    </span>
                    <span>{featured.date}</span>
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

        {/* Blog Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((post, idx) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.05 }}
            >
              <Card className="glass-card group cursor-pointer overflow-hidden h-full flex flex-col hover:shadow-lg transition-all hover:-translate-y-1">
                <div className="h-48 overflow-hidden relative">
                  <img
                    src={post.image}
                    alt={post.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    loading="lazy"
                  />
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
                <CardHeader className="pb-2">
                  <div className="text-sm text-primary font-bold mb-1">
                    {post.date}
                  </div>
                  <CardTitle className="line-clamp-2 group-hover:text-primary transition-colors">
                    {post.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col">
                  <p className="text-muted-foreground text-sm line-clamp-2 mb-4 flex-1">
                    {post.excerpt}
                  </p>
                  <div className="flex items-center justify-between text-xs text-muted-foreground pt-3 border-t border-border/30 mt-auto">
                    <span className="flex items-center gap-1">
                      <User className="h-3 w-3" /> {post.author}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" /> {post.readTime}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-20 text-muted-foreground">
            <p className="text-xl font-medium">No articles found</p>
            <p className="text-sm mt-2">
              Try a different search term or category
            </p>
          </div>
        )}
      </motion.div>
    </div>
  );
}
