'use client';

import { ToolScore } from '@/lib/scoring';
import { ToolReview, mockReviews } from '@/lib/mockReviews';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Star, ExternalLink, TrendingUp, Clock } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { getReviewDistribution } from '@/lib/leaderboard-utils';
import { formatDistanceToNow } from 'date-fns';
import { getToolLogo } from '@/lib/utils';
import { ToolLogo } from '@/components/ui/tool-logo';

interface ToolPreviewDrawerProps {
  score: ToolScore | null;
  isOpen: boolean;
  onClose: () => void;
  onAddToStack: (toolId: string) => void;
  onCompare: (score: ToolScore) => void;
}

export function ToolPreviewDrawer({
  score,
  isOpen,
  onClose,
  onAddToStack,
  onCompare,
}: ToolPreviewDrawerProps) {
  if (!score) return null;

  const distribution = getReviewDistribution(mockReviews, score.tool.slug);
  const totalReviews = score.reviewCount;
  const recentReviews = mockReviews
    .filter((r) => r.toolSlug === score.tool.slug)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 3);

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="right" className="w-full sm:max-w-xl overflow-y-auto">
        <SheetHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="relative w-12 h-12 rounded-lg overflow-hidden border bg-background flex items-center justify-center bg-muted/50">
              <ToolLogo tool={score.tool} className="w-10 h-10 object-contain" />
            </div>
            <div>
              <SheetTitle>{score.tool.name}</SheetTitle>
              <SheetDescription>{score.tool.tagline}</SheetDescription>
            </div>
          </div>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Score Breakdown */}
          <div>
            <h3 className="font-semibold mb-3">Score Breakdown</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  Average Rating
                </span>
                <div className="flex items-center gap-2">
                  <span className="font-bold">{score.avgRating.toFixed(2)}</span>
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

              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  Bayesian Score
                </span>
                <span className="font-bold">{score.bayesianScore.toFixed(2)}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  Recency Boost
                </span>
                <span className="font-bold text-green-600">
                  +{(score.finalScore - score.bayesianScore).toFixed(2)}
                </span>
              </div>

              <div className="pt-2 border-t">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold">Final Score</span>
                  <span className="text-lg font-bold text-primary">
                    {score.finalScore.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Review Distribution */}
          <div>
            <h3 className="font-semibold mb-3">
              Review Distribution ({totalReviews} reviews)
            </h3>
            <div className="space-y-2">
              {[5, 4, 3, 2, 1].map((rating) => {
                const count = distribution[rating as keyof typeof distribution];
                const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
                return (
                  <div key={rating} className="flex items-center gap-3">
                    <div className="flex items-center gap-1 w-12">
                      <span className="text-sm">{rating}</span>
                      <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                    </div>
                    <Progress value={percentage} className="flex-1" />
                    <span className="text-sm text-muted-foreground w-8 text-right">
                      {count}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Recent Reviews */}
          {recentReviews.length > 0 && (
            <div>
              <h3 className="font-semibold mb-3">Recent Reviews</h3>
              <div className="space-y-3">
                {recentReviews.map((review, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-lg bg-muted/50 border space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`w-3 h-3 ${
                              star <= review.rating
                                ? 'fill-yellow-400 text-yellow-400'
                                : 'fill-muted text-muted-foreground/20'
                            }`}
                          />
                        ))}
                      </div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="w-3 h-3" />
                        {formatDistanceToNow(new Date(review.createdAt), {
                          addSuffix: true,
                        })}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tool Details */}
          <div>
            <h3 className="font-semibold mb-3">Details</h3>
            <div className="space-y-3 text-sm">
              <div>
                <span className="text-muted-foreground">Category: </span>
                <Badge variant="secondary">{score.tool.category}</Badge>
              </div>
              <div>
                <span className="text-muted-foreground">Group: </span>
                <Badge variant="outline">{score.tool.group}</Badge>
              </div>
              <div>
                <span className="text-muted-foreground">Pricing: </span>
                <Badge variant="outline" className="capitalize">
                  {score.tool.pricing}
                </Badge>
              </div>
              <div>
                <span className="text-muted-foreground">Platforms: </span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {score.tool.platforms.map((platform) => (
                    <Badge key={platform} variant="outline" className="text-xs">
                      {platform}
                    </Badge>
                  ))}
                </div>
              </div>
              <div>
                <span className="text-muted-foreground">Tags: </span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {score.tool.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-2 pt-4 border-t">
            <Button
              onClick={() => onAddToStack(score.tool.id)}
              className="w-full"
            >
              Add to My Stack
            </Button>
            <div className="flex gap-2">
              <Button
                onClick={() => onCompare(score)}
                variant="outline"
                className="flex-1"
              >
                Compare
              </Button>
              <Button asChild variant="outline" className="flex-1">
                <Link href={`/tools/${score.tool.slug}`}>Full Details</Link>
              </Button>
              <Button asChild variant="outline" size="icon">
                <a
                  href={score.tool.websiteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <ExternalLink className="h-4 w-4" />
                </a>
              </Button>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

