'use client';

import { motion } from 'framer-motion';
import { Tool } from '@/lib/types';
import { ToolCard } from './tool-card';

interface ToolGridProps {
  tools: Tool[];
  onViewDetails?: (slug: string) => void;
}

export function ToolGrid({ tools, onViewDetails }: ToolGridProps) {
  if (tools.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center py-12"
      >
        <p className="text-muted-foreground text-lg">No tools found matching your criteria.</p>
        <p className="text-sm text-muted-foreground mt-2">Try adjusting your filters or search query.</p>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      initial="hidden"
      animate="visible"
      variants={{
        visible: {
          transition: {
            staggerChildren: 0.05,
          },
        },
      }}
    >
      {tools.map((tool) => (
        <motion.div
          key={tool.id}
          variants={{
            hidden: { opacity: 0, y: 20 },
            visible: {
              opacity: 1,
              y: 0,
              transition: {
                duration: 0.3,
                ease: 'easeOut',
              },
            },
          }}
        >
          <ToolCard tool={tool} onViewDetails={onViewDetails} />
        </motion.div>
      ))}
    </motion.div>
  );
}
