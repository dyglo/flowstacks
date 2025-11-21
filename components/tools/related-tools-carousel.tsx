'use client';

import { useRef, useState, useEffect } from 'react';
import { motion, useMotionValue, useTransform, animate } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Tool } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ExternalLink } from 'lucide-react';
import { getToolLogo, getToolInitial } from '@/lib/utils';
import { ToolLogo } from '@/components/ui/tool-logo';

interface RelatedToolsCarouselProps {
  tools: Tool[];
  onViewDetails?: (slug: string) => void;
}

export function RelatedToolsCarousel({ tools, onViewDetails }: RelatedToolsCarouselProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [isDragging, setIsDragging] = useState(false);

  const categoryColors: Record<string, string> = {
    writing: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
    meeting: 'bg-green-500/10 text-green-500 border-green-500/20',
    automation: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
    planning: 'bg-orange-500/10 text-orange-500 border-orange-500/20',
    research: 'bg-pink-500/10 text-pink-500 border-pink-500/20',
    devtools: 'bg-cyan-500/10 text-cyan-500 border-cyan-500/20',
    other: 'bg-gray-500/10 text-gray-500 border-gray-500/20',
  };

  const pricingColors: Record<string, string> = {
    free: 'bg-green-500/10 text-green-500 border-green-500/20',
    freemium: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
    paid: 'bg-red-500/10 text-red-500 border-red-500/20',
  };

  const updateScrollButtons = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (container) {
      updateScrollButtons();
      container.addEventListener('scroll', updateScrollButtons);
      return () => container.removeEventListener('scroll', updateScrollButtons);
    }
  }, [tools]);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 400;
      const newPosition = direction === 'left'
        ? scrollContainerRef.current.scrollLeft - scrollAmount
        : scrollContainerRef.current.scrollLeft + scrollAmount;

      scrollContainerRef.current.scrollTo({
        left: newPosition,
        behavior: 'smooth',
      });
    }
  };

  if (tools.length === 0) {
    return null;
  }

  return (
    <section className="py-8">
      <div className="mb-6">
        <h2 className="text-2xl font-bold">Related Tools</h2>
        <p className="text-muted-foreground mt-1">
          Explore similar tools in this category
        </p>
      </div>

      <div className="relative group">
        {canScrollLeft && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 hidden md:block"
          >
            <Button
              variant="outline"
              size="icon"
              onClick={() => scroll('left')}
              className="rounded-full bg-background/95 backdrop-blur-sm shadow-lg hover:scale-110 transition-transform"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
          </motion.div>
        )}

        {canScrollRight && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 hidden md:block"
          >
            <Button
              variant="outline"
              size="icon"
              onClick={() => scroll('right')}
              className="rounded-full bg-background/95 backdrop-blur-sm shadow-lg hover:scale-110 transition-transform"
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          </motion.div>
        )}

        <div
          ref={scrollContainerRef}
          className="flex gap-4 overflow-x-auto scrollbar-hide snap-x snap-mandatory scroll-smooth pb-4 px-1"
          style={{
            maskImage: 'linear-gradient(to right, transparent, black 40px, black calc(100% - 40px), transparent)',
            WebkitMaskImage: 'linear-gradient(to right, transparent, black 40px, black calc(100% - 40px), transparent)',
          }}
        >
          {tools.map((tool, index) => (
            <motion.div
              key={tool.id}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05, duration: 0.3 }}
              className="snap-start flex-shrink-0 w-80"
            >
              <motion.div
                whileHover={{ scale: 1.03, y: -4 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              >
                <Card 
                  className="h-full hover:border-primary/50 transition-all cursor-pointer group/card hover:shadow-lg"
                  onClick={() => onViewDetails && onViewDetails(tool.slug)}
                >
                  <CardHeader>
                    <div className="flex items-start gap-3">
                      <div className="relative w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 bg-muted/50 flex items-center justify-center">
                        <ToolLogo tool={tool} className="w-8 h-8 object-contain" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-base group-hover/card:text-primary transition-colors truncate">
                          {tool.name}
                        </CardTitle>
                        <CardDescription className="line-clamp-2 text-sm mt-1">
                          {tool.tagline}
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      <Badge variant="outline" className={`${categoryColors[tool.category]} text-xs`}>
                        {tool.category}
                      </Badge>
                      <Badge variant="outline" className={`${pricingColors[tool.pricing]} text-xs`}>
                        {tool.pricing}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {tool.tags.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="text-xs px-2 py-1 rounded-md bg-muted text-muted-foreground"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={(e) => {
                          e.stopPropagation();
                          onViewDetails && onViewDetails(tool.slug);
                        }}
                      >
                        View Details
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        asChild
                        className="hover:text-primary"
                      >
                        <a
                          href={tool.websiteUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </motion.div>
          ))}
        </div>
      </div>

      <style jsx global>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </section>
  );
}
