import { Link } from "react-router-dom";
import {
  MapPin,
  Star,
  ArrowRight,
  ChevronRight,
  Clock,
  Wallet,
  Ticket,
  Compass,
  TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  HOW_IT_WORKS,
  STATS,
  FEATURED_DESTINATIONS,
  THINGS_TO_DO,
  TRENDING_SECTIONS,
  TESTIMONIALS,
} from "@/lib/constants";
import { HeroSearchBar } from "@/components/home/HeroSearchBar";
import { RecommendationCarousel } from "@/components/home/RecommendationCarousel";
import { TravelGallery } from "@/components/home/TravelGallery";
import { ReviewSection } from "@/components/common/ReviewSection";
import { HotelCard } from "@/components/recommendations/HotelCard";
import { TransportCard } from "@/components/recommendations/TransportCard";
import { useHotels, useTransport } from "@/hooks/useRecommendations";
import { useAppStats } from "@/hooks/useAppStats";
import { motion, useInView } from "framer-motion";
import { useRef, useEffect, useState } from "react";
import { formatCurrency } from "@/lib/utils";

// Animated count-up component
function CountUp({
  end,
  suffix = "",
  duration = 2,
}: {
  end: number;
  suffix?: string;
  duration?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true });
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!isInView) return;
    let start = 0;
    const increment = end / (duration * 60);
    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 1000 / 60);
    return () => clearInterval(timer);
  }, [isInView, end, duration]);

  return (
    <span ref={ref}>
      {count.toLocaleString()}
      {suffix}
    </span>
  );
}

export function LandingPage() {
  const { data: hotels = [] } = useHotels({ maxPrice: 15000 });
  const { data: transportOptions = [] } = useTransport({});
  const { data: statsData } = useAppStats();
  const displayStats = statsData || STATS;

  return (
    <div className="flex flex-col min-h-screen">
      {/* ============================================ */}
      {/* 1. HERO SECTION — Full-width with parallax */}
      {/* ============================================ */}
      <section className="relative pt-32 pb-16 md:pt-40 md:pb-24 flex flex-col justify-center overflow-hidden min-h-[90vh]">
        <div className="container relative z-10 mx-auto px-4 md:px-6 flex flex-col lg:flex-row items-center gap-12 lg:gap-8">
          {/* Left Column - Typography & Search */}
          <div className="flex-1 flex flex-col items-center lg:items-start text-center lg:text-left z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-3 py-1 text-accent mb-6 uppercase tracking-wider text-sm font-bold"
            >
              AI-Powered Trip Planning
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-5xl md:text-6xl lg:text-[5.5rem] font-bold tracking-tight mb-6 text-foreground leading-[1.05]"
            >
              Plan Your Perfect Trip with{" "}
              <span className="italic font-normal bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                AI Magic.
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl font-sans"
            >
              Tell TripCraft's AI where you want to go. It builds your complete
              itinerary — hotels, restaurants, activities, and things to do —
              instantly. Invite your group, vote on the plan together, split the
              budget, and hit the road.
            </motion.p>

            {/* Smart Search Bar */}
            <div className="w-full flex justify-center lg:justify-start">
              <HeroSearchBar />
            </div>
          </div>

          {/* Right Column - Masonry Collage */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="flex-1 w-full relative h-[600px] hidden lg:block z-0"
          >
            {/* Arched image */}
            <div className="absolute top-0 right-1/2 translate-x-[20%] w-[260px] h-[360px] rounded-t-[130px] rounded-b-xl overflow-hidden shadow-2xl transition-transform hover:scale-105 duration-500">
              <img
                src="https://images.unsplash.com/photo-1516483638261-f4dafaa48cce?q=80&w=600"
                alt="Positano"
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-4 left-5 text-white text-lg font-bold italic drop-shadow-md font-heading">
                Positano
              </div>
            </div>

            {/* Pill image top right */}
            <div className="absolute top-4 right-0 w-[300px] h-[160px] rounded-[30px] overflow-hidden shadow-2xl transition-transform hover:scale-105 duration-500 delay-100">
              <img
                src="https://images.unsplash.com/photo-1528127269322-539801943592?q=80&w=600"
                alt="Halong Bay"
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-3 left-5 text-white text-lg font-bold italic drop-shadow-md font-heading">
                Halong Bay
              </div>
            </div>

            {/* Arch-corner image middle right */}
            <div className="absolute top-[180px] right-[10%] w-[240px] h-[140px] rounded-tl-[100px] rounded-br-[60px] rounded-tr-xl rounded-bl-xl overflow-hidden shadow-2xl transition-transform hover:scale-105 duration-500 delay-200">
              <img
                src="https://images.unsplash.com/photo-1503899036067-e13e8d75bab7?q=80&w=600"
                alt="Tokyo"
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-3 left-5 text-white text-lg font-bold italic drop-shadow-md font-heading">
                Tokyo
              </div>
            </div>

            {/* Wide image bottom center */}
            <div className="absolute top-[380px] right-1/2 translate-x-[35%] w-[380px] h-[140px] rounded-2xl overflow-hidden shadow-2xl z-10 transition-transform hover:scale-105 duration-500 delay-300">
              <img
                src="https://images.unsplash.com/photo-1539020140153-e479b8c22e70?q=80&w=600"
                alt="Marrakech"
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-3 left-5 text-white text-lg font-bold italic drop-shadow-md font-heading">
                Marrakech
              </div>
            </div>

            {/* Tall arched image bottom right */}
            <div className="absolute top-[340px] right-0 w-[160px] h-[240px] rounded-t-full rounded-b-xl overflow-hidden shadow-2xl z-0 transition-transform hover:scale-105 duration-500 delay-100">
              <img
                src="https://images.unsplash.com/photo-1499856871958-5b9627545d1a?q=80&w=600"
                alt="Amalfi Coast"
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-3 left-5 text-white text-lg font-bold italic drop-shadow-md font-heading">
                Amalfi Coast
              </div>
            </div>
          </motion.div>
        </div>

        {/* Trusted Partners */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="container mx-auto px-4 md:px-6 mt-16 md:mt-24 pb-8"
        >
          <div className="flex flex-wrap items-center justify-center lg:justify-start gap-8 md:gap-12 opacity-70 hover:opacity-100 transition-opacity duration-300">
            <span className="text-sm font-bold tracking-widest uppercase text-muted-foreground mr-4">
              Trusted Partners
            </span>
            <span className="text-xl font-bold font-sans text-blue-600 tracking-tighter">
              stripe
            </span>
            <span className="text-xl font-bold font-sans text-orange-600">
              GetYourGuide
            </span>
            <span className="text-xl font-bold font-sans text-blue-900 dark:text-blue-300">
              Booking.com
            </span>
            <span className="text-xl font-bold font-sans text-orange-500">
              RVshare
            </span>
            <span className="text-xl font-bold font-sans text-blue-500">
              agoda
            </span>
          </div>
        </motion.div>
      </section>

      {/* ============================================ */}
      {/* 2. STATS SECTION — Animated count-up */}
      {/* ============================================ */}
      <section className="py-14 bg-card border-y border-border">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {displayStats.map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="flex flex-col items-center text-center space-y-2"
              >
                <span className="text-3xl md:text-4xl font-bold text-foreground">
                  <CountUp end={stat.value} suffix={stat.suffix} />
                </span>
                <span className="text-sm text-muted-foreground font-medium">
                  {stat.label}
                </span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================ */}
      {/* 3. POPULAR DESTINATIONS — Card grid */}
      {/* ============================================ */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4 md:px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex items-end justify-between mb-12"
          >
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-2">
                Popular Destinations
              </h2>
              <p className="text-muted-foreground text-lg">
                Handpicked destinations our travelers love
              </p>
            </div>
            <Button variant="ghost" className="hidden md:flex gap-1" asChild>
              <Link to="/destinations">
                See All <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {FEATURED_DESTINATIONS.slice(0, 8).map((dest, index) => (
              <motion.div
                key={dest.id}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ delay: index * 0.06, duration: 0.5 }}
              >
                <Card
                  className="glass-card group cursor-pointer overflow-hidden h-full flex flex-col"
                  onClick={() => {}}
                >
                  <div className="relative h-52 overflow-hidden">
                    <img
                      src={dest.image}
                      alt={dest.name}
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent opacity-60 group-hover:opacity-90 transition-opacity duration-300" />
                    <div className="absolute top-3 right-3 z-20 bg-white/20 backdrop-blur-md px-2.5 py-1 rounded-full text-white text-xs font-bold flex items-center gap-1 border border-white/10">
                      <Star className="h-3 w-3 fill-amber-400 text-amber-400" />{" "}
                      {dest.rating}
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 p-5 z-20">
                      <h3 className="text-xl font-bold text-white mb-1">
                        {dest.name}
                      </h3>
                      <div className="flex items-center gap-1.5 text-white/90 text-sm">
                        <MapPin className="h-3.5 w-3.5" /> {dest.country}
                      </div>
                    </div>
                  </div>
                  <CardContent className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" /> {dest.bestSeason}
                    </div>
                    <div className="flex items-center gap-1 text-sm font-bold text-primary">
                      <Wallet className="h-3.5 w-3.5" /> ₹
                      {dest.averageBudget.toLocaleString()}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          <div className="mt-8 text-center md:hidden">
            <Button variant="outline" className="rounded-full" asChild>
              <Link to="/destinations">
                View All Destinations <ArrowRight className="h-4 w-4 ml-2" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* ============================================ */}
      {/* 4. THINGS TO DO */}
      {/* ============================================ */}
      <section className="py-20 bg-card/50">
        <div className="container mx-auto px-4 md:px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex items-end justify-between mb-12"
          >
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-2 flex items-center gap-3">
                <Compass className="h-8 w-8 text-emerald-500" /> Things To Do
              </h2>
              <p className="text-muted-foreground text-lg">
                Unforgettable activities curated by locals
              </p>
            </div>
            <Button variant="ghost" className="hidden md:flex gap-1" asChild>
              <Link to="/things-to-do">
                See All <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {THINGS_TO_DO.slice(0, 4).map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.08 }}
              >
                <Card className="glass-card group cursor-pointer overflow-hidden h-full flex flex-col">
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute top-3 left-3 bg-emerald-500/90 px-3 py-1 rounded-full text-white text-xs font-bold">
                      {item.category}
                    </div>
                    <div className="absolute top-3 right-3 bg-white/20 backdrop-blur-md px-2 py-0.5 rounded-full text-white text-xs font-bold flex items-center gap-1 border border-white/10">
                      <Star className="h-3 w-3 fill-amber-400 text-amber-400" />{" "}
                      {item.rating}
                    </div>
                  </div>
                  <CardContent className="p-4 flex flex-col flex-1">
                    <h3 className="font-bold text-sm mb-1.5 group-hover:text-emerald-600 transition-colors line-clamp-2">
                      {item.title}
                    </h3>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
                      <MapPin className="h-3 w-3" /> {item.location}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" /> {item.duration}
                      </span>
                    </div>
                    <div className="mt-auto flex items-center justify-between">
                      <span className="text-sm font-bold text-foreground">
                        {formatCurrency(item.price)}
                      </span>
                      <Button
                        variant="gradient"
                        size="sm"
                        className="rounded-full text-xs h-8 gap-1 shadow-md"
                      >
                        <Ticket className="h-3 w-3" /> Book Now
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================ */}
      {/* 5. HOW IT WORKS */}
      {/* ============================================ */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-4 md:px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center max-w-2xl mx-auto mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              How TripCraft AI Works
            </h2>
            <p className="text-muted-foreground text-lg">
              Your perfect itinerary is just three simple steps away.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 relative">
            <div className="hidden md:block absolute top-12 left-[15%] right-[15%] h-0.5 bg-border z-0" />
            {HOW_IT_WORKS.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="relative z-10 flex flex-col items-center text-center space-y-4"
              >
                <div className="w-24 h-24 rounded-full bg-card border-4 border-background shadow-xl flex items-center justify-center text-4xl mb-4">
                  {item.icon}
                </div>
                <h3 className="text-xl font-bold">
                  {item.step}. {item.title}
                </h3>
                <p className="text-muted-foreground">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================ */}
      {/* 6. TRENDING DESTINATIONS */}
      {/* ============================================ */}
      <section className="py-20 bg-card/50">
        <div className="container mx-auto px-4 md:px-6 space-y-16">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center max-w-2xl mx-auto"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4 flex items-center justify-center gap-3">
              <TrendingUp className="h-8 w-8 text-primary" /> Trending
              Destinations
            </h2>
            <p className="text-muted-foreground text-lg">
              What's hot right now among travelers
            </p>
          </motion.div>

          {TRENDING_SECTIONS.slice(0, 3).map((section) => (
            <div key={section.id}>
              <h3 className="text-2xl font-bold mb-6">{section.title}</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {section.destinations.map((dest, index) => (
                  <motion.div
                    key={dest.name}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.08 }}
                  >
                    <Card className="glass-card overflow-hidden group cursor-pointer h-full">
                      <div className="relative h-56 overflow-hidden">
                        <div className="absolute top-3 left-3 z-20 bg-black/50 backdrop-blur-md px-3 py-1 rounded-full text-white text-xs font-medium border border-white/10">
                          {dest.tag}
                        </div>
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-10" />
                        <img
                          src={dest.image}
                          alt={dest.name}
                          className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                          loading="lazy"
                        />
                        <div className="absolute bottom-0 left-0 right-0 p-5 z-20 text-white">
                          <h4 className="text-xl font-bold mb-1">
                            {dest.name}
                          </h4>
                          <div className="flex items-center gap-3 text-sm text-white/90">
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3.5 w-3.5" /> {dest.country}
                            </span>
                            <span className="flex items-center gap-1">
                              <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />{" "}
                              {dest.rating}
                            </span>
                          </div>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ============================================ */}
      {/* 7. HOTEL & FLIGHT RECOMMENDATIONS */}
      {/* ============================================ */}
      {hotels.length > 0 && (
        <RecommendationCarousel
          title="Top Rated Hotels for You"
          subtitle="Discover luxury stays and budget-friendly options directly from our database."
        >
          {hotels.map((hotel: any, index: number) => (
            <motion.div
              key={hotel.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              className="min-w-[300px] max-w-[300px] md:min-w-[350px] snap-center"
            >
              <HotelCard hotel={hotel} />
            </motion.div>
          ))}
        </RecommendationCarousel>
      )}

      {transportOptions.length > 0 && (
        <RecommendationCarousel
          title="Explore Flights & Routes"
          subtitle="Compare travel options from multiple providers."
        >
          {transportOptions.map((transport: any, index: number) => (
            <motion.div
              key={transport.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              className="min-w-[300px] max-w-[300px] md:min-w-[350px] snap-center"
            >
              <TransportCard transport={transport} />
            </motion.div>
          ))}
        </RecommendationCarousel>
      )}

      {/* ============================================ */}
      {/* 8. TRAVEL GALLERY */}
      {/* ============================================ */}
      <TravelGallery />

      {/* ============================================ */}
      {/* 9. REVIEWS & RATINGS */}
      {/* ============================================ */}
      <ReviewSection />

      {/* ============================================ */}
      {/* 10. TESTIMONIALS */}
      {/* ============================================ */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4 md:px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center max-w-2xl mx-auto mb-14"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              What Travelers Say
            </h2>
            <p className="text-muted-foreground text-lg">
              Join thousands of happy travelers
            </p>
          </motion.div>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {TESTIMONIALS.map((t, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <Card className="glass-card p-6 h-full flex flex-col">
                  <div className="flex gap-0.5 mb-4">
                    {[...Array(t.rating)].map((_, j) => (
                      <Star
                        key={j}
                        className="h-4 w-4 fill-amber-400 text-amber-400"
                      />
                    ))}
                  </div>
                  <p className="text-sm text-foreground/80 leading-relaxed flex-1 mb-6">
                    "{t.content}"
                  </p>
                  <div className="flex items-center gap-3 mt-auto pt-4 border-t border-border/30">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold text-sm">
                      {t.name[0]}
                    </div>
                    <div>
                      <p className="font-bold text-sm">{t.name}</p>
                      <p className="text-xs text-muted-foreground">{t.role}</p>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================ */}
      {/* 11. CTA SECTION */}
      {/* ============================================ */}
      <section className="py-24 bg-primary text-primary-foreground relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" />
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-black/20 to-transparent" />

        <div className="container mx-auto px-4 md:px-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto text-center space-y-8"
          >
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight">
              Ready to start your adventure?
            </h2>
            <p className="text-xl text-primary-foreground/80">
              Join thousands of travelers who have already discovered the
              smartest way to plan their trips.
            </p>
            <Button
              size="lg"
              variant="secondary"
              className="rounded-full h-14 px-10 text-lg font-bold shadow-2xl hover:scale-105 transition-transform"
              asChild
            >
              <Link to="/plan">
                Generate My Itinerary <ArrowRight className="h-5 w-5 ml-2" />
              </Link>
            </Button>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
