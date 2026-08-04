"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, MapPin, ChevronLeft, ChevronRight } from "lucide-react";
import { GALLERY_IMAGES } from "@/lib/constants";

export function TravelGallery() {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const openLightbox = (index: number) => setLightboxIndex(index);
  const closeLightbox = () => setLightboxIndex(null);
  const nextImage = () =>
    setLightboxIndex((prev) =>
      prev !== null ? (prev + 1) % GALLERY_IMAGES.length : 0,
    );
  const prevImage = () =>
    setLightboxIndex((prev) =>
      prev !== null
        ? (prev - 1 + GALLERY_IMAGES.length) % GALLERY_IMAGES.length
        : 0,
    );

  const heightMap = {
    tall: "row-span-2",
    medium: "row-span-1",
    short: "row-span-1",
  };

  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4 md:px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-2xl mx-auto mb-14"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Travel Gallery
          </h2>
          <p className="text-muted-foreground text-lg">
            Beautiful moments from destinations around the world
          </p>
        </motion.div>

        {/* Masonry Grid */}
        <div className="columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
          {GALLERY_IMAGES.map((img, index) => (
            <motion.div
              key={img.id}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ delay: index * 0.05, duration: 0.5 }}
              className="break-inside-avoid group relative overflow-hidden rounded-2xl cursor-pointer"
              onClick={() => openLightbox(index)}
            >
              <img
                src={img.src}
                alt={img.alt}
                className="w-full object-cover transition-transform duration-700 group-hover:scale-110"
                loading="lazy"
              />
              {/* Hover Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col justify-end p-4">
                <div className="flex items-center gap-1.5 text-white text-sm font-medium transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                  <MapPin className="h-4 w-4" />
                  {img.location}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {lightboxIndex !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-lg flex items-center justify-center"
            onClick={closeLightbox}
          >
            <button
              onClick={closeLightbox}
              className="absolute top-6 right-6 z-10 text-white/80 hover:text-white p-2 rounded-full bg-white/10 backdrop-blur-sm transition-colors"
            >
              <X className="h-6 w-6" />
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                prevImage();
              }}
              className="absolute left-4 md:left-8 z-10 text-white/80 hover:text-white p-3 rounded-full bg-white/10 backdrop-blur-sm transition-colors"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                nextImage();
              }}
              className="absolute right-4 md:right-8 z-10 text-white/80 hover:text-white p-3 rounded-full bg-white/10 backdrop-blur-sm transition-colors"
            >
              <ChevronRight className="h-6 w-6" />
            </button>

            <motion.div
              key={lightboxIndex}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3 }}
              className="max-w-5xl max-h-[85vh] px-4"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={GALLERY_IMAGES[lightboxIndex].src}
                alt={GALLERY_IMAGES[lightboxIndex].alt}
                className="max-h-[80vh] w-auto mx-auto rounded-2xl object-contain shadow-2xl"
              />
              <div className="text-center mt-4">
                <p className="text-white font-semibold text-lg">
                  {GALLERY_IMAGES[lightboxIndex].alt}
                </p>
                <p className="text-white/60 text-sm flex items-center justify-center gap-1.5 mt-1">
                  <MapPin className="h-3.5 w-3.5" />
                  {GALLERY_IMAGES[lightboxIndex].location}
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
