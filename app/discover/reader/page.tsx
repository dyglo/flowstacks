'use client';

import { useEffect, useState, useMemo, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, ExternalLink, Sparkles, Calendar, Globe, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useDiscoveryStore } from '@/lib/discovery-store';
import { matchToolsToArticle } from '@/lib/matchToolsToArticle';
import { getArticleSummary } from '@/lib/articleSummary';
import { getAllTools } from '@/lib/data';
import { Tool } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { getToolLogo, getToolInitial } from '@/lib/utils';
import { ToolLogo } from '@/components/ui/tool-logo';

function ReaderContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const articleId = searchParams.get('id');
  
  const getArticle = useDiscoveryStore(state => state.getArticle);
  const article = articleId ? getArticle(articleId) : null;

  const [summary, setSummary] = useState<string>('');
  const [loadingSummary, setLoadingSummary] = useState(true);

  // Match tools using advanced algorithm
  const matchedTools = useMemo(() => {
    if (!article) return [];
    const allTools = getAllTools();
    return matchToolsToArticle(
      {
        title: article.title,
        snippet: article.snippet,
        url: article.url,
        source: article.source,
      },
      allTools,
      { maxResults: 8, minScore: 1.5 }
    );
  }, [article]);

  // Fetch summary
  useEffect(() => {
    if (article) {
      setLoadingSummary(true);
      getArticleSummary({
        title: article.title,
        url: article.url,
        snippet: article.snippet,
        source: article.source,
      })
        .then(setSummary)
        .catch((err) => {
          console.error('Failed to generate summary:', err);
          setSummary('Unable to generate summary at this time.');
        })
        .finally(() => setLoadingSummary(false));
    }
  }, [article]);

  if (!article) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Article Not Found</h2>
          <p className="text-muted-foreground mb-6">
            The article you're looking for doesn't exist or has expired.
          </p>
          <Button asChild>
            <Link href="/discover">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Discovery
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  const extractDomain = (url: string): string => {
    try {
      return new URL(url).hostname.replace('www.', '');
    } catch {
      return url;
    }
  };

  const domain = article.source || extractDomain(article.url);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push('/discover')}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Discovery
            </Button>
            <Button
              variant="outline"
              size="sm"
              asChild
            >
              <a
                href={article.url}
                target="_blank"
                rel="noopener noreferrer"
                className="gap-2"
              >
                <ExternalLink className="h-4 w-4" />
                Original Article
              </a>
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container max-w-4xl mx-auto px-4 py-8">
        <motion.article
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-8"
        >
          {/* Article Header */}
          <header className="space-y-4">
            <h1 className="text-4xl md:text-5xl font-bold leading-tight">
              {article.title}
            </h1>
            
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4" />
                <span className="font-medium">{domain}</span>
              </div>
              {article.timestamp && (
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>{new Date(article.timestamp).toLocaleDateString()}</span>
                </div>
              )}
            </div>
          </header>

          <Separator />

          {/* AI Summary Section */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-semibold">AI Summary</h2>
            </div>
            
            {loadingSummary ? (
              <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
                <CardContent className="pt-6 space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-5/6" />
                  <Skeleton className="h-4 w-4/6" />
                </CardContent>
              </Card>
            ) : (
              <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
                <CardContent className="pt-6">
                  <p className="text-base leading-relaxed">{summary}</p>
                  <p className="text-xs text-muted-foreground mt-4 italic">
                    Generated by FlowStacks AI
                  </p>
                </CardContent>
              </Card>
            )}
          </section>

          {/* Article Content Preview */}
          <section>
            <h2 className="text-xl font-semibold mb-4">Article Preview</h2>
            <div className="prose prose-slate dark:prose-invert max-w-none">
              <p className="text-base leading-relaxed">
                {article.snippet}
              </p>
              <div className="mt-6 p-6 bg-muted/50 rounded-lg border-l-4 border-primary">
                <p className="text-sm text-muted-foreground mb-3">
                  This is a preview from the search results. For the full article, visit the original source.
                </p>
                <Button asChild variant="default" size="sm">
                  <a
                    href={article.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="gap-2"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                    Read Full Article
                  </a>
                </Button>
              </div>
            </div>
          </section>

          <Separator />

          {/* Tools Mentioned Section */}
          <section>
            <div className="flex items-center gap-2 mb-6">
              <Sparkles className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-semibold">Tools Mentioned in This Article</h2>
            </div>

            {matchedTools.length === 0 ? (
              <Card className="border-dashed">
                <CardContent className="pt-8 pb-8 text-center">
                  <Sparkles className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    No specific tools were detected in this article.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {matchedTools.map((tool) => (
                  <ReaderToolCard key={tool.id} tool={tool} />
                ))}
              </div>
            )}
          </section>

          {/* Related Suggestions */}
          <section className="pt-8">
            <Card className="bg-muted/30">
              <CardContent className="pt-6">
                <h3 className="font-semibold mb-3">Discover More</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Continue exploring AI tools and productivity solutions on FlowStacks.
                </p>
                <div className="flex flex-wrap gap-3">
                  <Button variant="outline" size="sm" asChild>
                    <Link href="/tools">Browse All Tools</Link>
                  </Button>
                  <Button variant="outline" size="sm" asChild>
                    <Link href="/collections">View Collections</Link>
                  </Button>
                  <Button variant="outline" size="sm" asChild>
                    <Link href="/discover">Back to Discovery</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </section>
        </motion.article>
      </div>
    </div>
  );
}

// Tool Card for Reader View
function ReaderToolCard({ tool }: { tool: Tool }) {
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
    <Card className="hover:border-primary/50 transition-colors group h-full">
      <CardHeader className="pb-3">
        <div className="flex items-start gap-3">
          <div className="relative w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-muted/50 flex items-center justify-center">
            <ToolLogo tool={tool} className="w-10 h-10 object-contain" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <CardTitle className="text-base group-hover:text-primary transition-colors">
                {tool.name}
              </CardTitle>
              {tool.featured && (
                <Sparkles className="h-3.5 w-3.5 text-primary fill-primary" />
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

      <CardContent className="pt-0">
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
          >
            <a
              href={tool.websiteUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// Main export with Suspense boundary
export default function ReaderPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    }>
      <ReaderContent />
    </Suspense>
  );
}

