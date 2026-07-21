import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const BACKGROUND_IMAGES = [
  'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?q=80&w=2070&auto=format&fit=crop', // Lake/Mountains
  'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?q=80&w=2020&auto=format&fit=crop', // Paris
  'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=2073&auto=format&fit=crop', // Tropical Beach
  'https://images.unsplash.com/photo-1542051812871-701d50b4eeaf?q=80&w=2070&auto=format&fit=crop', // Tokyo City
  'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?q=80&w=2021&auto=format&fit=crop'  // Road Trip
];

export function DynamicBackground() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % BACKGROUND_IMAGES.length);
    }, 6000); // Change image every 6 seconds

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="absolute inset-0 z-0 overflow-hidden bg-black">
      <AnimatePresence initial={false}>
        <motion.img
          key={currentIndex}
          src={BACKGROUND_IMAGES[currentIndex]}
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 0.6, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.5, ease: 'easeInOut' }}
          className="absolute inset-0 w-full h-full object-cover dark:opacity-40"
          alt="Travel Background"
        />
      </AnimatePresence>
      <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/60 to-background z-10 pointer-events-none" />
    </div>
  );
}
