'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { SmartFilter } from '@/lib/smart-filters';
import { Badge } from '@/components/ui/badge';
import { Sparkles } from 'lucide-react';

interface SmartChipsProps {
  filters: SmartFilter[];
  onFilterClick: (filter: SmartFilter) => void;
}

const filterTypeIcons = {
  category: '📁',
  pricing: '💰',
  tag: '🏷️',
};

export function SmartChips({ filters, onFilterClick }: SmartChipsProps) {
  if (filters.length === 0) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="mb-6"
    >
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Sparkles className="h-4 w-4" />
          <span className="font-medium">Smart Filters:</span>
        </div>
        <AnimatePresence mode="popLayout">
          {filters.map((filter, index) => (
            <motion.div
              key={`${filter.type}-${filter.value}`}
              initial={{ opacity: 0, scale: 0.8, x: -20 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.8, x: -20 }}
              transition={{
                duration: 0.2,
                delay: index * 0.05,
                type: 'spring',
                stiffness: 400,
                damping: 25,
              }}
            >
              <Badge
                variant="secondary"
                className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-all duration-200 px-3 py-1.5 text-sm font-medium hover:scale-105 active:scale-95"
                onClick={() => onFilterClick(filter)}
              >
                <span className="mr-1.5">{filterTypeIcons[filter.type]}</span>
                {filter.label}
              </Badge>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
