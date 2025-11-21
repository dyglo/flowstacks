'use client';

import { useState } from 'react';
import { ToolScore } from '@/lib/scoring';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Star, X, ArrowRight, ExternalLink } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { getToolLogo } from '@/lib/utils';
import { ToolLogo } from '@/components/ui/tool-logo';

interface ToolComparisonDrawerProps {
  tools: ToolScore[];
  isOpen: boolean;
  onClose: () => void;
  onRemove: (slug: string) => void;
}

export function ToolComparisonDrawer({
  tools,
  isOpen,
  onClose,
  onRemove,
}: ToolComparisonDrawerProps) {
  if (tools.length === 0) return null;

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="bottom" className="h-[80vh] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Compare Tools ({tools.length}/3)</SheetTitle>
          <SheetDescription>
            Side-by-side comparison of selected tools
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {tools.map((score) => (
            <Card key={score.tool.id} className="p-4 relative">
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2 h-6 w-6"
                onClick={() => onRemove(score.tool.slug)}
              >
                <X className="h-4 w-4" />
              </Button>

              <div className="flex items-center gap-3 mb-4">
                <div className="relative w-12 h-12 rounded-lg overflow-hidden border bg-background flex items-center justify-center bg-muted/50">
                  <ToolLogo tool={score.tool} className="w-10 h-10 object-contain" />
                </div>
                <div>
                  <h3 className="font-semibold">{score.tool.name}</h3>
                  <p className="text-xs text-muted-foreground line-clamp-1">
                    {score.tool.tagline}
                  </p>
                </div>
              </div>

              <div className="space-y-3 text-sm">
                <div>
                  <div className="text-muted-foreground mb-1">Rating</div>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold">
                      {score.avgRating.toFixed(1)}
                    </span>
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-3 h-3 ${
                            star <= Math.round(score.avgRating)
                              ? 'fill-yellow-400 text-yellow-400'
                              : 'fill-muted text-muted-foreground/20'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                <div>
                  <div className="text-muted-foreground mb-1">Reviews</div>
                  <div className="font-semibold">{score.reviewCount}</div>
                </div>

                <div>
                  <div className="text-muted-foreground mb-1">Final Score</div>
                  <div className="font-semibold">
                    {score.finalScore.toFixed(2)}
                  </div>
                </div>

                <div>
                  <div className="text-muted-foreground mb-1">
                    Bayesian Score
                  </div>
                  <div className="font-semibold">
                    {score.bayesianScore.toFixed(2)}
                  </div>
                </div>

                <div>
                  <div className="text-muted-foreground mb-1">Category</div>
                  <Badge variant="secondary" className="text-xs">
                    {score.tool.category}
                  </Badge>
                </div>

                <div>
                  <div className="text-muted-foreground mb-1">Pricing</div>
                  <Badge variant="outline" className="text-xs capitalize">
                    {score.tool.pricing}
                  </Badge>
                </div>

                <div>
                  <div className="text-muted-foreground mb-1">Platforms</div>
                  <div className="flex flex-wrap gap-1">
                    {score.tool.platforms.slice(0, 3).map((platform) => (
                      <Badge
                        key={platform}
                        variant="outline"
                        className="text-xs"
                      >
                        {platform}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-4 flex gap-2">
                <Button asChild size="sm" className="flex-1">
                  <Link href={`/tools/${score.tool.slug}`}>
                    Details <ArrowRight className="ml-1 h-3 w-3" />
                  </Link>
                </Button>
                <Button asChild size="sm" variant="outline">
                  <a
                    href={score.tool.websiteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </SheetContent>
    </Sheet>
  );
}

