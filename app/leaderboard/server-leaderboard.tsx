import React from 'react';
import { getAllTools } from "@/lib/data";
import { getReviewAggregates } from "@/lib/supabaseServerClient";
import { computeToolAggregates, getTopToolsFromAggregates, ToolAggregate } from "@/lib/scoring";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Star, Trophy, Medal, Award, Sparkles } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { getToolLogo } from "@/lib/utils";
import { ToolLogo } from "@/components/ui/tool-logo";

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`w-3 h-3 ${
            star <= Math.round(rating)
              ? "fill-yellow-400 text-yellow-400"
              : "fill-muted text-muted-foreground/20"
          }`}
        />
      ))}
    </div>
  );
}

function RankBadge({ rank }: { rank: number }) {
  if (rank === 1) {
    return (
      <div className="flex items-center justify-center w-7 h-7 rounded-full bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 font-bold text-xs">
        <Trophy className="w-3.5 h-3.5" />
      </div>
    );
  }
  if (rank === 2) {
    return (
      <div className="flex items-center justify-center w-7 h-7 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-bold text-xs">
        <Medal className="w-3.5 h-3.5" />
      </div>
    );
  }
  if (rank === 3) {
    return (
      <div className="flex items-center justify-center w-7 h-7 rounded-full bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 font-bold text-xs">
        <Award className="w-3.5 h-3.5" />
      </div>
    );
  }
  return (
    <div className="flex items-center justify-center w-7 h-7 rounded-full bg-muted text-muted-foreground font-bold text-xs">
      #{rank}
    </div>
  );
}

interface ToolCardProps {
  aggregate: ToolAggregate;
  rank: number;
}

function ToolCard({ aggregate, rank }: ToolCardProps) {
  const { tool } = aggregate;

  return (
    <Card className="h-full hover:border-primary/50 transition-all hover:shadow-lg p-4">
      <div className="flex items-start gap-3 mb-3">
        <RankBadge rank={rank} />
        <div className="relative w-10 h-10 flex-shrink-0 rounded-lg overflow-hidden border bg-background flex items-center justify-center bg-muted/50">
          <ToolLogo tool={tool} className="w-8 h-8 object-contain" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-base leading-tight hover:text-primary transition-colors line-clamp-1">
            {tool.name}
          </h3>
          <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
            {tool.tagline}
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-xl font-bold">{aggregate.avgRating.toFixed(1)}</span>
          <StarRating rating={aggregate.avgRating} />
        </div>
        <div className="text-xs text-muted-foreground">
          {aggregate.reviewCount} {aggregate.reviewCount === 1 ? 'review' : 'reviews'}
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5 mb-3">
        <Badge variant="secondary" className="text-xs font-normal">
          {tool.category}
        </Badge>
        <Badge variant="outline" className="text-xs font-normal capitalize">
          {tool.pricing}
        </Badge>
      </div>

      <Button
        asChild
        size="sm"
        variant="outline"
        className="w-full"
      >
        <Link href={`/tools/${tool.slug}`}>View tool</Link>
      </Button>
    </Card>
  );
}

interface CategorySectionProps {
  title: string;
  description: string;
  aggregates: ToolAggregate[];
  icon?: React.ElementType;
}

function CategorySection({ title, description, aggregates, icon: Icon }: CategorySectionProps) {
  if (aggregates.length === 0) {
    return (
      <Card className="p-6 border-dashed">
        <div className="text-center text-muted-foreground">
          <p className="text-sm">No tools ranked in this category yet.</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6 hover:shadow-lg transition-shadow">
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-1">
          {Icon && <Icon className="w-5 h-5 text-primary" />}
          <h2 className="text-xl font-bold tracking-tight">{title}</h2>
        </div>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {aggregates.map((aggregate, index) => (
          <ToolCard
            key={aggregate.tool.id}
            aggregate={aggregate}
            rank={index + 1}
          />
        ))}
      </div>
    </Card>
  );
}

export async function ServerLeaderboard() {
  const tools = getAllTools();
  const reviewAggs = await getReviewAggregates();
  const aggregates = computeToolAggregates(tools, reviewAggs);

  // Overall Top 10
  const overallTop10 = getTopToolsFromAggregates(
    aggregates,
    () => true,
    10,
    3
  );

  // Top 10 AI Code Assistants
  const codeAssistantsTop10 = getTopToolsFromAggregates(
    aggregates,
    (agg) =>
      agg.tool.group === 'AI Coding & Developer Tools' &&
      agg.tool.category === 'AI Code Assistants',
    10,
    1
  );

  // Top 10 AI Productivity Tools
  const productivityTop10 = getTopToolsFromAggregates(
    aggregates,
    (agg) => agg.tool.group === 'AI Productivity',
    10,
    1
  );

  // Top 10 AI Design & Media
  const designToolsTop10 = getTopToolsFromAggregates(
    aggregates,
    (agg) => agg.tool.group === 'AI Design Tools',
    10,
    1
  );

  return (
    <>
      {/* Main Leaderboards with Tabs */}
      <Tabs defaultValue="overall" className="mb-6">
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4">
          <TabsTrigger value="overall">Overall</TabsTrigger>
          <TabsTrigger value="code">Code Assistants</TabsTrigger>
          <TabsTrigger value="productivity">Productivity</TabsTrigger>
          <TabsTrigger value="design">Design</TabsTrigger>
        </TabsList>

        <TabsContent value="overall" className="mt-6">
          <CategorySection
            title="Overall Top Rated"
            description="The absolute best AI tools across all categories with at least 3 reviews."
            aggregates={overallTop10}
            icon={Trophy}
          />
        </TabsContent>

        <TabsContent value="code" className="mt-6">
          <CategorySection
            title="Top AI Code Assistants"
            description="Best-in-class tools for coding, debugging, and development."
            aggregates={codeAssistantsTop10}
            icon={Medal}
          />
        </TabsContent>

        <TabsContent value="productivity" className="mt-6">
          <CategorySection
            title="Top AI Productivity Tools"
            description="Tools to supercharge your daily workflow and personal productivity."
            aggregates={productivityTop10}
            icon={Award}
          />
        </TabsContent>

        <TabsContent value="design" className="mt-6">
          <CategorySection
            title="Top AI Design Tools"
            description="Create stunning visuals, videos, and designs with AI assistance."
            aggregates={designToolsTop10}
            icon={Sparkles}
          />
        </TabsContent>
      </Tabs>

      {aggregates.length === 0 && (
        <Card className="p-6 border-dashed">
          <div className="text-center text-muted-foreground">
            <p className="text-sm">No reviews yet. Be the first to review a tool!</p>
          </div>
        </Card>
      )}
    </>
  );
}

