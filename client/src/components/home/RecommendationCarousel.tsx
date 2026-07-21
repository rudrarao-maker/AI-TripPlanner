import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useRef } from 'react';
import { Button } from '@/components/ui/button';

interface RecommendationCarouselProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}

export function RecommendationCarousel({ title, subtitle, children }: RecommendationCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const scrollTo = direction === 'left' ? scrollLeft - clientWidth + 100 : scrollLeft + clientWidth - 100;
      scrollRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
    }
  };

  return (
    <section className="py-12 bg-background border-t border-border/50">
      <div className="container mx-auto px-4 md:px-6">
        
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">{title}</h2>
            {subtitle && <p className="text-muted-foreground mt-2">{subtitle}</p>}
          </div>
          
          <div className="hidden md:flex items-center gap-2">
            <Button variant="outline" size="icon" className="rounded-full h-10 w-10" onClick={() => scroll('left')}>
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <Button variant="outline" size="icon" className="rounded-full h-10 w-10" onClick={() => scroll('right')}>
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>
        </div>

        <div className="relative -mx-4 md:mx-0">
          <div 
            ref={scrollRef}
            className="flex gap-4 overflow-x-auto snap-x snap-mandatory hide-scrollbar pb-6 px-4 md:px-0"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {children}
          </div>
        </div>

      </div>
    </section>
  );
}
