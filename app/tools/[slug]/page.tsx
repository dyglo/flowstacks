import { notFound } from 'next/navigation';
import { ExternalLink, Globe, PackageOpen, Sparkles, Users, ArrowLeft, MessageSquare } from 'lucide-react';
import Link from 'next/link';
import { getToolBySlug, getAllTools, getToolsByCategory } from '@/lib/data';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { RelatedToolsCarouselWrapper } from '@/components/tools/related-tools-carousel-wrapper';
import { getToolReviewsWithProfiles, computeReviewStats } from '@/lib/supabaseServerClient';
import { ToolReviewsSection } from '@/components/tools/tool-reviews-section';
import { ReviewWithProfile } from '@/lib/types';

export function generateStaticParams() {
  const tools = getAllTools();
  return tools.map((tool) => ({
    slug: tool.slug,
  }));
}

export default async function ToolDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const tool = getToolBySlug(slug);

  if (!tool) {
    notFound();
  }

  const relatedTools = getToolsByCategory(tool.category)
    .filter(t => t.id !== tool.id)
    .slice(0, 8);

  // Fetch reviews from Supabase
  let reviews: ReviewWithProfile[] = [];
  try {
    reviews = await getToolReviewsWithProfiles(slug);
  } catch (error) {
    console.error('Failed to fetch reviews:', error);
    // Continue with empty reviews array
  }

  const { avgRating, count } = computeReviewStats(reviews);

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
    <div className="container max-w-4xl mx-auto px-4 py-8">
      <Button variant="ghost" asChild className="mb-6">
        <Link href="/tools">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Tools
        </Link>
      </Button>

      <div className="space-y-8">
        <div>
          <div className="flex items-start justify-between gap-4 mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h1 className="text-4xl font-bold">{tool.name}</h1>
                {tool.featured && (
                  <Sparkles className="h-6 w-6 text-primary fill-primary" />
                )}
              </div>
              <p className="text-xl text-muted-foreground">{tool.tagline}</p>
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
        </div>

        <Separator />

        <div>
          <h2 className="text-xl font-semibold mb-3 flex items-center gap-2">
            <PackageOpen className="h-5 w-5" />
            About
          </h2>
          <p className="text-muted-foreground leading-relaxed">{tool.description}</p>
        </div>

        <Separator />

        <div>
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Users className="h-5 w-5" />
            Best For
          </h2>
          <div className="flex flex-wrap gap-2">
            {tool.bestFor.map((persona) => (
              <Badge key={persona} variant="secondary" className="text-sm">
                {persona}
              </Badge>
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Platforms
          </h2>
          <div className="flex flex-wrap gap-2">
            {tool.platforms.map((platform) => (
              <Badge key={platform} variant="outline" className="text-sm">
                {platform}
              </Badge>
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-4">Tags</h2>
          <div className="flex flex-wrap gap-2">
            {tool.tags.map((tag) => (
              <Badge key={tag} variant="secondary">
                {tag}
              </Badge>
            ))}
          </div>
        </div>

        <Separator />

        <div className="flex gap-3">
          <Button asChild className="flex-1" size="lg">
            <a href={tool.websiteUrl} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-4 w-4 mr-2" />
              Open Website
            </a>
          </Button>
          {tool.productHuntUrl && (
            <Button variant="outline" asChild size="lg">
              <a href={tool.productHuntUrl} target="_blank" rel="noopener noreferrer">
                Product Hunt
              </a>
            </Button>
          )}
        </div>

        <Separator />

        {/* Reviews Section */}
        <div>
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Reviews
          </h2>
          
          <ToolReviewsSection 
            toolSlug={tool.slug}
            reviews={reviews}
            avgRating={avgRating}
            reviewCount={count}
          />
        </div>

        {relatedTools.length > 0 && (
          <>
            <Separator />
            <RelatedToolsCarouselWrapper tools={relatedTools} />
          </>
        )}
      </div>
    </div>
  );
}
