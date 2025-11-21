'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeftRight, X, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useCompare } from '@/lib/compare-store';
import { getAllTools } from '@/lib/data';
import { Tool } from '@/lib/types';
import { useState, useEffect } from 'react';

export function CompareView() {
  const { compareIds, clearCompare } = useCompare();
  const [isOpen, setIsOpen] = useState(false);
  const [showPopup, setShowPopup] = useState(false);

  const allTools = getAllTools();
  const compareTools = allTools.filter((tool) => compareIds.includes(tool.id));

  useEffect(() => {
    if (compareIds.length >= 2) {
      setShowPopup(true);
    } else {
      setShowPopup(false);
    }
  }, [compareIds.length]);

  const handleOpen = () => {
    setIsOpen(true);
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  const handleClear = () => {
    clearCompare();
    setIsOpen(false);
  };

  const handleDismissPopup = () => {
    setShowPopup(false);
  };

  const categoryColors: Record<string, string> = {
    writing: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
    meeting: 'bg-green-500/10 text-green-500 border-green-500/20',
    automation: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
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

  return (
    <>
      <AnimatePresence>
        {showPopup && compareIds.length >= 2 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 50 }}
            transition={{ type: 'spring', duration: 0.5 }}
            className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm"
            onClick={handleDismissPopup}
          >
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', duration: 0.4, delay: 0.1 }}
              className="bg-card border-2 border-primary rounded-2xl shadow-2xl p-8 max-w-md mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center space-y-4">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-2">
                  <ArrowLeftRight className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold mb-2">
                    Ready to Compare
                  </h2>
                  <p className="text-muted-foreground">
                    You've selected {compareIds.length} tools. Compare them side-by-side to find the best fit.
                  </p>
                </div>
                <div className="flex gap-3 pt-4">
                  <Button
                    variant="outline"
                    onClick={handleDismissPopup}
                    className="flex-1"
                  >
                    Not Now
                  </Button>
                  <Button
                    onClick={() => {
                      handleDismissPopup();
                      handleOpen();
                    }}
                    className="flex-1 gap-2"
                  >
                    <ArrowLeftRight className="h-4 w-4" />
                    Compare Now
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-5xl max-h-[90vh] flex flex-col p-0">
          <DialogHeader className="p-6 pb-4 flex-shrink-0">
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle className="text-2xl">Tool Comparison</DialogTitle>
                <DialogDescription>
                  Compare {compareTools.length} tools side-by-side
                </DialogDescription>
              </div>
              <Button variant="ghost" size="sm" onClick={handleClear}>
                <X className="h-4 w-4 mr-2" />
                Clear
              </Button>
            </div>
          </DialogHeader>

          <ScrollArea className="flex-1 px-6 pb-6">
            <div className="space-y-8 pr-4">
              <div className="hidden md:block">
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                  {compareTools.map((tool) => (
                    <ToolCompareCard
                      key={tool.id}
                      tool={tool}
                      categoryColors={categoryColors}
                      pricingColors={pricingColors}
                    />
                  ))}
                </div>
              </div>

              <div className="md:hidden space-y-4">
                {compareTools.map((tool, index) => (
                  <div key={tool.id}>
                    {index > 0 && <div className="border-t my-4" />}
                    <ToolCompareCard
                      tool={tool}
                      categoryColors={categoryColors}
                      pricingColors={pricingColors}
                    />
                  </div>
                ))}
              </div>
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </>
  );
}

function ToolCompareCard({
  tool,
  categoryColors,
  pricingColors,
}: {
  tool: Tool;
  categoryColors: Record<string, string>;
  pricingColors: Record<string, string>;
}) {
  return (
    <div className="border rounded-lg p-4 space-y-4 bg-card">
      <div className="space-y-2">
        <h3 className="font-semibold text-lg">{tool.name}</h3>
        <p className="text-sm text-muted-foreground">{tool.tagline}</p>
      </div>

      <div className="space-y-3">
        <div>
          <p className="text-xs font-medium text-muted-foreground mb-1.5">
            Category
          </p>
          <Badge variant="outline" className={categoryColors[tool.category]}>
            {tool.category}
          </Badge>
        </div>

        <div>
          <p className="text-xs font-medium text-muted-foreground mb-1.5">
            Pricing
          </p>
          <Badge variant="outline" className={pricingColors[tool.pricing]}>
            {tool.pricing}
          </Badge>
        </div>

        <div>
          <p className="text-xs font-medium text-muted-foreground mb-1.5">
            Platforms
          </p>
          <div className="flex flex-wrap gap-1.5">
            {tool.platforms.map((platform) => (
              <Badge key={platform} variant="secondary" className="text-xs">
                {platform}
              </Badge>
            ))}
          </div>
        </div>

        <div>
          <p className="text-xs font-medium text-muted-foreground mb-1.5">
            Best For
          </p>
          <div className="flex flex-wrap gap-1.5">
            {tool.bestFor.map((bf) => (
              <Badge key={bf} variant="outline" className="text-xs">
                {bf}
              </Badge>
            ))}
          </div>
        </div>

        <div>
          <p className="text-xs font-medium text-muted-foreground mb-1.5">
            Tags
          </p>
          <div className="flex flex-wrap gap-1.5">
            {tool.tags.slice(0, 5).map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        </div>
      </div>

      <Button asChild size="sm" className="w-full gap-2">
        <a href={tool.websiteUrl} target="_blank" rel="noopener noreferrer">
          <ExternalLink className="h-4 w-4" />
          Open Website
        </a>
      </Button>
    </div>
  );
}
