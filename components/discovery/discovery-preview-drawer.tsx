'use client';

import { useMemo, useState, useEffect } from 'react';
import { ExternalLink, Sparkles, BookOpen, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { SearchResult, Tool } from '@/lib/types';
import { matchToolsToArticle } from '@/lib/matchToolsToArticle';
import { getArticleSummary } from '@/lib/articleSummary';
import { getAllTools } from '@/lib/data';
import { useDiscoveryStore } from '@/lib/discovery-store';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';
import { getToolLogo, getToolInitial } from '@/lib/utils';
import { ToolLogo } from '@/components/ui/tool-logo';

interface DiscoveryPreviewDrawerProps {
  result: SearchResult | null;
  isOpen: boolean;
  onClose: () => void;
  searchQuery: string;
}

export function DiscoveryPreviewDrawer({
  result,
  isOpen,
  onClose,
  searchQuery,
}: DiscoveryPreviewDrawerProps) {
  const router = useRouter();
  const addArticle = useDiscoveryStore(state => state.addArticle);
  const setCurrentArticle = useDiscoveryStore(state => state.setCurrentArticle);
  
  const [summary, setSummary] = useState<string>('');
  const [loadingSummary, setLoadingSummary] = useState(false);

  // Match tools using advanced algorithm
  const matchedTools = useMemo(() => {
    if (!result) return [];
    const allTools = getAllTools();
    return matchToolsToArticle(
      {
        title: result.title,
        snippet: result.snippet,
        url: result.url,
        source: result.source,
      },
      allTools,
      { maxResults: 6, minScore: 1.5 }
    );
  }, [result]);

  // Fetch summary when drawer opens
  useEffect(() => {
    if (result && isOpen) {
      setLoadingSummary(true);
      setSummary('');
      
      getArticleSummary({
        title: result.title,
        url: result.url,
        snippet: result.snippet,
        source: result.source,
      })
        .then(setSummary)
        .catch((err) => {
          console.error('Failed to generate summary:', err);
          setSummary('Unable to generate summary at this time.');
        })
        .finally(() => setLoadingSummary(false));
    }
  }, [result, isOpen]);

  const handleOpenReader = () => {
    if (!result) return;
    
    // Add article to store and navigate to reader
    const articleId = addArticle(result);
    setCurrentArticle(articleId);
    router.push(`/discover/reader?id=${articleId}`);
    onClose();
  };

  if (!result) return null;

  const extractDomain = (url: string): string => {
    try {
      return new URL(url).hostname.replace('www.', '');
    } catch {
      return url;
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent 
        side="right" 
        className="p-0 overflow-hidden flex flex-col"
      >
        <SheetHeader className="px-6 pt-6 pb-4 space-y-3">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <SheetTitle className="text-xl leading-tight pr-8">
                {result.title}
              </SheetTitle>
              <SheetDescription className="text-sm mt-2 flex items-center gap-2">
                <span className="font-medium">{extractDomain(result.url)}</span>
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        <Separator />

        <ScrollArea className="flex-1 px-6 py-4">
          <div className="space-y-6">
            {/* AI Summary Section */}
            <div>
              <h3 className="text-sm font-semibold mb-2 text-muted-foreground uppercase tracking-wide flex items-center gap-2">
                <Sparkles className="h-3.5 w-3.5" />
                AI Summary
              </h3>
              {loadingSummary ? (
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-5/6" />
                  <Skeleton className="h-4 w-4/6" />
                </div>
              ) : (
                <p className="text-sm leading-relaxed text-foreground bg-muted/30 rounded-lg p-3 border">
                  {summary}
                </p>
              )}
            </div>

            <Separator />

            {/* Article Snippet */}
            <div>
              <h3 className="text-sm font-semibold mb-2 text-muted-foreground uppercase tracking-wide">
                Preview
              </h3>
              <p className="text-sm leading-relaxed text-foreground">
                {result.snippet}
              </p>
            </div>

            <Separator />

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-3">
              <Button
                onClick={handleOpenReader}
                variant="default"
                size="lg"
                className="gap-2"
              >
                <BookOpen className="h-4 w-4" />
                Reader View
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
              >
                <a
                  href={result.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="gap-2"
                >
                  <ExternalLink className="h-4 w-4" />
                  Original
                </a>
              </Button>
            </div>

            <Separator />

            {/* Tools Mentioned Section */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="h-4 w-4 text-primary" />
                <h3 className="text-sm font-semibold text-foreground">
                  Tools Mentioned in This Article
                </h3>
              </div>

              {matchedTools.length === 0 ? (
                <Card className="border-dashed">
                  <CardContent className="pt-6 text-center">
                    <p className="text-sm text-muted-foreground">
                      No specific tools detected in this article.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-3">
                  <p className="text-xs text-muted-foreground">
                    Found {matchedTools.length} tool{matchedTools.length > 1 ? 's' : ''} mentioned
                  </p>
                  
                  {matchedTools.map((tool) => (
                    <CompactToolCard key={tool.id} tool={tool} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}

// Compact Tool Card for drawer
function CompactToolCard({ tool }: { tool: Tool }) {
  const categoryColors: Record<string, string> = {
    'Writing & Communication': 'bg-blue-500/10 text-blue-500 border-blue-500/20',
    'Meeting & Scheduling': 'bg-green-500/10 text-green-500 border-green-500/20',
    'Automation & Workflows': 'bg-purple-500/10 text-purple-500 border-purple-500/20',
    'Planning & Management': 'bg-orange-500/10 text-orange-500 border-orange-500/20',
    'Research & Analysis': 'bg-pink-500/10 text-pink-500 border-pink-500/20',
    'Development Tools': 'bg-cyan-500/10 text-cyan-500 border-cyan-500/20',
  };

  const pricingColors: Record<string, string> = {
    free: 'bg-green-500/10 text-green-500 border-green-500/20',
    freemium: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
    paid: 'bg-red-500/10 text-red-500 border-red-500/20',
  };

  return (
    <Card className="hover:border-primary/50 transition-colors group">
      <CardHeader className="p-4 pb-3">
        <div className="flex items-start gap-3">
          <div className="relative w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 bg-muted/50 flex items-center justify-center">
            <ToolLogo tool={tool} className="w-8 h-8 object-contain" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <CardTitle className="text-base group-hover:text-primary transition-colors">
                {tool.name}
              </CardTitle>
              {tool.featured && (
                <Sparkles className="h-3 w-3 text-primary fill-primary" />
              )}
            </div>
            <CardDescription className="text-xs line-clamp-2">
              {tool.tagline}
            </CardDescription>
          </div>
        </div>

        <div className="flex flex-wrap gap-1.5 mt-3">
          <Badge 
            variant="outline" 
            className={`text-xs ${categoryColors[tool.category] || 'bg-gray-500/10 text-gray-500 border-gray-500/20'}`}
          >
            {tool.category}
          </Badge>
          <Badge 
            variant="outline" 
            className={`text-xs ${pricingColors[tool.pricing]}`}
          >
            {tool.pricing}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="p-4 pt-0">
        <div className="flex gap-2">
          <Link href={`/tools/${tool.slug}`} className="flex-1">
            <Button variant="outline" size="sm" className="w-full text-xs">
              View Details
            </Button>
          </Link>
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
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

