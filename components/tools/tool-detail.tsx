'use client';

import { ExternalLink, Globe, PackageOpen, Sparkles, Users } from 'lucide-react';
import { Tool } from '@/lib/types';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { RelatedToolsCarousel } from './related-tools-carousel';
import { getToolLogo, getToolInitial } from '@/lib/utils';
import { ToolLogo } from '@/components/ui/tool-logo';

interface ToolDetailProps {
  tool: Tool | null;
  isOpen: boolean;
  onClose: () => void;
  relatedTools?: Tool[];
  onViewDetails?: (slug: string) => void;
}

export function ToolDetail({ tool, isOpen, onClose, relatedTools = [], onViewDetails }: ToolDetailProps) {
  if (!tool) return null;

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
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="overflow-y-auto w-full sm:max-w-2xl">
        <SheetHeader className="space-y-4">
          <div className="flex items-start gap-4">
            <div className="relative w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 bg-muted/50 flex items-center justify-center">
              <ToolLogo tool={tool} className="w-12 h-12 object-contain" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <SheetTitle className="text-2xl">{tool.name}</SheetTitle>
                {tool.featured && (
                  <Sparkles className="h-5 w-5 text-primary fill-primary" />
                )}
              </div>
              <SheetDescription className="text-base">{tool.tagline}</SheetDescription>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className={categoryColors[tool.category]}>
              {tool.category}
            </Badge>
            <Badge variant="outline" className={pricingColors[tool.pricing]}>
              {tool.pricing}
            </Badge>
          </div>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          <div>
            <h3 className="font-semibold mb-2 flex items-center gap-2">
              <PackageOpen className="h-4 w-4" />
              About
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{tool.description}</p>
          </div>

          <Separator />

          <div>
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Users className="h-4 w-4" />
              Best For
            </h3>
            <div className="flex flex-wrap gap-2">
              {tool.bestFor.map((persona) => (
                <Badge key={persona} variant="secondary">
                  {persona}
                </Badge>
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Globe className="h-4 w-4" />
              Platforms
            </h3>
            <div className="flex flex-wrap gap-2">
              {tool.platforms.map((platform) => (
                <Badge key={platform} variant="outline">
                  {platform}
                </Badge>
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-3">Tags</h3>
            <div className="flex flex-wrap gap-2">
              {tool.tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>

          <Separator />

          <div className="flex gap-3">
            <Button asChild className="flex-1">
              <a href={tool.websiteUrl} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4 mr-2" />
                Open Website
              </a>
            </Button>
            {tool.productHuntUrl && (
              <Button variant="outline" asChild>
                <a href={tool.productHuntUrl} target="_blank" rel="noopener noreferrer">
                  Product Hunt
                </a>
              </Button>
            )}
          </div>

          {relatedTools.length > 0 && (
            <>
              <Separator />
              <RelatedToolsCarousel tools={relatedTools} onViewDetails={onViewDetails} />
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
