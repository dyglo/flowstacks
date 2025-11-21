'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Tool } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getToolLogo, getToolInitial } from '@/lib/utils';
import { ToolLogo } from '@/components/ui/tool-logo';

interface HoverPreviewCardProps {
  tool: Tool;
  isVisible: boolean;
  position: { x: number; y: number };
  categoryColors: Record<string, string>;
  pricingColors: Record<string, string>;
  onViewDetails: () => void;
}

export function HoverPreviewCard({
  tool,
  isVisible,
  position,
  categoryColors,
  pricingColors,
  onViewDetails,
}: HoverPreviewCardProps) {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 10 }}
          transition={{
            duration: 0.15,
            type: 'spring',
            stiffness: 500,
            damping: 30,
          }}
          style={{
            position: 'fixed',
            left: `${position.x}px`,
            top: `${position.y}px`,
            zIndex: 50,
          }}
          className="pointer-events-none"
        >
          <div className="bg-card border-2 border-border rounded-xl shadow-2xl p-5 w-80 pointer-events-auto">
            <div className="flex items-start gap-4 mb-4">
              <div className="relative w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-muted/50 flex items-center justify-center">
                <ToolLogo tool={tool} className="w-10 h-10 object-contain" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-lg leading-tight mb-1 truncate">
                  {tool.name}
                </h3>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {tool.tagline}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 mb-4">
              <Badge className={categoryColors[tool.category]} variant="secondary">
                {tool.category}
              </Badge>
              <Badge className={pricingColors[tool.pricing]} variant="secondary">
                {tool.pricing}
              </Badge>
            </div>

            {tool.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-4">
                {tool.tags.slice(0, 3).map((tag) => (
                  <span
                    key={tag}
                    className="text-xs px-2 py-1 rounded-md bg-muted text-muted-foreground"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

            <Button
              size="sm"
              className="w-full gap-2"
              onClick={onViewDetails}
            >
              <ExternalLink className="h-3.5 w-3.5" />
              View Details
            </Button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
