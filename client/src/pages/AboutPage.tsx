import { motion } from "framer-motion";

export function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-24 min-h-screen">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-3xl mx-auto space-y-8"
      >
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
          About TripCraft AI
        </h1>
        <p className="text-xl text-muted-foreground leading-relaxed">
          We believe travel planning should be as exciting as the trip itself.
          TripCraft AI was born from the desire to eliminate the endless hours
          spent researching, cross-referencing, and booking across dozens of
          tabs.
        </p>

        <div className="grid md:grid-cols-2 gap-8 py-8">
          <div className="space-y-4">
            <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold text-xl">
              1
            </div>
            <h3 className="text-xl font-semibold">Intelligent Curation</h3>
            <p className="text-muted-foreground">
              Our AI understands your unique preferences to craft itineraries
              that feel tailor-made.
            </p>
          </div>
          <div className="space-y-4">
            <div className="h-12 w-12 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-500 font-bold text-xl">
              2
            </div>
            <h3 className="text-xl font-semibold">Real-Time Sync</h3>
            <p className="text-muted-foreground">
              Prices, weather, and availability are constantly monitored to
              ensure your plans remain bulletproof.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
