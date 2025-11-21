'use client';

import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ExternalLink, Sparkles, Plus, Check } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { Tool } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { useStack } from '@/lib/stack-store';
import { useCompare } from '@/lib/compare-store';
import { HoverPreviewCard } from './hover-preview-card';
import { getToolLogo, getToolInitial } from '@/lib/utils';
import { ToolLogo } from '@/components/ui/tool-logo';

interface ToolCardProps {
  tool: Tool;
  onViewDetails?: (slug: string) => void;
  enableHoverPreview?: boolean;
}

export function ToolCard({ tool, onViewDetails, enableHoverPreview = true }: ToolCardProps) {
  const { toggleTool, isInStack } = useStack();
  const { toggleCompare, isInCompare } = useCompare();
  const inStack = isInStack(tool.id);
  const inCompare = isInCompare(tool.id);

  const [showPreview, setShowPreview] = useState(false);
  const [previewPosition, setPreviewPosition] = useState({ x: 0, y: 0 });
  const [isMobile, setIsMobile] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

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

  const handleMouseEnter = () => {
    if (isMobile || !enableHoverPreview) return;

    hoverTimeoutRef.current = setTimeout(() => {
      if (cardRef.current) {
        const rect = cardRef.current.getBoundingClientRect();
        const spaceOnRight = window.innerWidth - rect.right;
        const x = spaceOnRight > 350 ? rect.right + 10 : rect.left - 330;
        const y = Math.max(10, rect.top);

        setPreviewPosition({ x, y });
        setShowPreview(true);
      }
    }, 400);
  };

  const handleMouseLeave = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    setShowPreview(false);
  };

  const handleToggleStack = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleTool(tool.id);
  };

  const handleToggleCompare = (checked: boolean) => {
    toggleCompare(tool.id);
  };

  return (
    <>
      <motion.div
        ref={cardRef}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ scale: 1.02, y: -4 }}
        transition={{ duration: 0.2 }}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <Card className={`h-full hover:border-primary/50 transition-colors cursor-pointer group ${inStack ? 'border-primary/70 bg-primary/5' : ''}`}>
        <CardHeader>
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-start gap-3 flex-1">
              <div className="relative w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 bg-muted/50 flex items-center justify-center">
                <ToolLogo tool={tool} className="w-8 h-8 object-contain" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <CardTitle className="text-lg group-hover:text-primary transition-colors">
                    {tool.name}
                  </CardTitle>
                  {tool.featured && (
                    <Sparkles className="h-4 w-4 text-primary fill-primary" />
                  )}
                </div>
                <CardDescription className="line-clamp-2">{tool.tagline}</CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-1.5 pt-1">
              <Checkbox
                id={`compare-${tool.id}`}
                checked={inCompare}
                onCheckedChange={handleToggleCompare}
                onClick={(e) => e.stopPropagation()}
                aria-label="Compare tool"
              />
              <label
                htmlFor={`compare-${tool.id}`}
                className="text-xs text-muted-foreground cursor-pointer select-none"
                onClick={(e) => e.stopPropagation()}
              >
                Compare
              </label>
            </div>
          </div>

          <div className="flex flex-wrap gap-1.5 mt-3">
            <Badge variant="outline" className={categoryColors[tool.category]}>
              {tool.category}
            </Badge>
            <Badge variant="outline" className={pricingColors[tool.pricing]}>
              {tool.pricing}
            </Badge>
          </div>
        </CardHeader>

        <CardContent>
          <div className="flex flex-wrap gap-1.5 mb-4">
            {tool.tags.slice(0, 3).map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>

          <div className="flex gap-2">
            <Button
              variant={inStack ? 'default' : 'outline'}
              size="sm"
              onClick={handleToggleStack}
              className="gap-1.5"
            >
              {inStack ? (
                <>
                  <Check className="h-3.5 w-3.5" />
                  In Stack
                </>
              ) : (
                <>
                  <Plus className="h-3.5 w-3.5" />
                  Add
                </>
              )}
            </Button>
            {onViewDetails ? (
              <Button
                variant="ghost"
                size="sm"
                className="flex-1"
                onClick={() => onViewDetails(tool.slug)}
              >
                Details
              </Button>
            ) : (
              <Link href={`/tools/${tool.slug}`} className="flex-1">
                <Button variant="ghost" size="sm" className="w-full">
                  Details
                </Button>
              </Link>
            )}
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

      {!isMobile && enableHoverPreview && (
        <HoverPreviewCard
          tool={tool}
          isVisible={showPreview}
          position={previewPosition}
          categoryColors={categoryColors}
          pricingColors={pricingColors}
          onViewDetails={() => {
            setShowPreview(false);
            if (onViewDetails) {
              onViewDetails(tool.slug);
            }
          }}
        />
      )}
    </>
  );
}
