import { ToolReview } from "./mockReviews";
import { ToolScore } from "./scoring";

export type TimeFilter = "all" | "month" | "week" | "trending";

export interface ToolWithTrend extends ToolScore {
  trend: "up" | "down" | "stable" | "new";
  trendValue: number; // percentage change
}

export function filterReviewsByTime(
  reviews: ToolReview[],
  filter: TimeFilter
): ToolReview[] {
  const now = new Date();
  
  if (filter === "all") return reviews;
  
  const cutoffDate = new Date();
  if (filter === "week") {
    cutoffDate.setDate(now.getDate() - 7);
  } else if (filter === "month") {
    cutoffDate.setMonth(now.getMonth() - 1);
  } else if (filter === "trending") {
    cutoffDate.setDate(now.getDate() - 14); // Last 2 weeks for trending
  }
  
  return reviews.filter(r => new Date(r.createdAt) >= cutoffDate);
}

export function calculateTrend(
  currentScores: ToolScore[],
  previousScores: ToolScore[]
): ToolWithTrend[] {
  return currentScores.map(current => {
    const previous = previousScores.find(p => p.tool.slug === current.tool.slug);
    
    if (!previous || previous.reviewCount === 0) {
      return {
        ...current,
        trend: "new" as const,
        trendValue: 0,
      };
    }
    
    const scoreDiff = current.finalScore - previous.finalScore;
    const trendValue = (scoreDiff / previous.finalScore) * 100;
    
    let trend: "up" | "down" | "stable" = "stable";
    if (trendValue > 2) trend = "up";
    else if (trendValue < -2) trend = "down";
    
    return {
      ...current,
      trend,
      trendValue: Math.abs(trendValue),
    };
  });
}

export function getHiddenGems(scores: ToolScore[]): ToolScore[] {
  // High rated but low review count
  return scores
    .filter(s => s.avgRating >= 4.5 && s.reviewCount >= 3 && s.reviewCount <= 5)
    .sort((a, b) => b.avgRating - a.avgRating)
    .slice(0, 10);
}

export function getMostReviewed(scores: ToolScore[]): ToolScore[] {
  return scores
    .filter(s => s.reviewCount > 0)
    .sort((a, b) => b.reviewCount - a.reviewCount)
    .slice(0, 10);
}

export function getNewEntries(scores: ToolScore[]): ToolScore[] {
  const twoWeeksAgo = new Date();
  twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
  
  return scores
    .filter(s => s.lastReviewAt && s.lastReviewAt >= twoWeeksAgo && s.reviewCount >= 2)
    .sort((a, b) => b.finalScore - a.finalScore)
    .slice(0, 10);
}

export function getReviewDistribution(reviews: ToolReview[], toolSlug: string) {
  const toolReviews = reviews.filter(r => r.toolSlug === toolSlug);
  const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  
  toolReviews.forEach(r => {
    const rating = Math.round(r.rating) as 1 | 2 | 3 | 4 | 5;
    distribution[rating]++;
  });
  
  return distribution;
}

export interface ToolBadge {
  label: string;
  variant: "default" | "secondary" | "success" | "warning" | "destructive";
  icon?: string;
}

export function getToolBadges(score: ToolScore, allScores: ToolScore[]): ToolBadge[] {
  const badges: ToolBadge[] = [];
  
  // Top Rated
  if (score.avgRating >= 4.8 && score.reviewCount >= 5) {
    badges.push({ label: "Top Rated", variant: "default", icon: "⭐" });
  }
  
  // Most Reviewed
  const sortedByReviews = [...allScores].sort((a, b) => b.reviewCount - a.reviewCount);
  const topReviewedIndex = sortedByReviews.findIndex(s => s.tool.slug === score.tool.slug);
  if (topReviewedIndex < 3 && score.reviewCount >= 10) {
    badges.push({ label: "Most Reviewed", variant: "secondary", icon: "💬" });
  }
  
  // Trending
  if (score.lastReviewAt) {
    const daysSince = (new Date().getTime() - score.lastReviewAt.getTime()) / (1000 * 60 * 60 * 24);
    if (daysSince <= 7 && score.reviewCount >= 3) {
      badges.push({ label: "Trending", variant: "warning", icon: "🔥" });
    }
  }
  
  // Hidden Gem
  if (score.avgRating >= 4.5 && score.reviewCount >= 3 && score.reviewCount <= 5) {
    badges.push({ label: "Hidden Gem", variant: "success", icon: "💎" });
  }
  
  return badges;
}

export type SortOption = "score" | "rating" | "reviews" | "recency" | "name";

export function sortToolScores(
  scores: ToolScore[],
  sortBy: SortOption,
  ascending = false
): ToolScore[] {
  const sorted = [...scores].sort((a, b) => {
    let comparison = 0;
    
    switch (sortBy) {
      case "score":
        comparison = b.finalScore - a.finalScore;
        break;
      case "rating":
        comparison = b.avgRating - a.avgRating;
        break;
      case "reviews":
        comparison = b.reviewCount - a.reviewCount;
        break;
      case "recency":
        const aTime = a.lastReviewAt?.getTime() || 0;
        const bTime = b.lastReviewAt?.getTime() || 0;
        comparison = bTime - aTime;
        break;
      case "name":
        comparison = a.tool.name.localeCompare(b.tool.name);
        break;
    }
    
    return ascending ? -comparison : comparison;
  });
  
  return sorted;
}

