
import { Tool } from "@/lib/types";
import { ToolReview } from "@/lib/mockReviews";
import { RawReviewAggregate } from "./supabaseServerClient";

export interface ToolScore {
  tool: Tool;
  avgRating: number;
  reviewCount: number;
  lastReviewAt?: Date;
  bayesianScore: number;
  finalScore: number;
}

export interface ToolAggregate {
  tool: Tool;
  avgRating: number;
  reviewCount: number;
  lastReviewAt?: Date | null;
  bayesianScore: number;
  finalScore: number;
}

export function computeToolScores(
  tools: Tool[],
  reviews: ToolReview[],
  options?: { m?: number; maxRecencyBoost?: number }
): ToolScore[] {
  const m = options?.m ?? 10;
  const maxRecencyBoost = options?.maxRecencyBoost ?? 0.3;

  // 1. Aggregate reviews by tool
  const toolStats = new Map<string, { sum: number; count: number; lastAt: number }>();
  let globalSum = 0;
  let globalCount = 0;

  for (const review of reviews) {
    const stats = toolStats.get(review.toolSlug) || { sum: 0, count: 0, lastAt: 0 };
    stats.sum += review.rating;
    stats.count += 1;
    const reviewTime = new Date(review.createdAt).getTime();
    if (reviewTime > stats.lastAt) {
      stats.lastAt = reviewTime;
    }
    toolStats.set(review.toolSlug, stats);

    globalSum += review.rating;
    globalCount += 1;
  }

  // 2. Compute global mean C
  const C = globalCount > 0 ? globalSum / globalCount : 0;

  // 3. Compute scores for each tool
  return tools.map((tool) => {
    const stats = toolStats.get(tool.slug);
    
    if (!stats || stats.count === 0) {
      return {
        tool,
        avgRating: 0,
        reviewCount: 0,
        lastReviewAt: undefined,
        bayesianScore: 0,
        finalScore: 0,
      };
    }

    const avgRating = stats.sum / stats.count;
    const reviewCount = stats.count;
    const lastReviewAt = new Date(stats.lastAt);

    // Bayesian score: (v / (v + m)) * R + (m / (v + m)) * C
    const v = reviewCount;
    const R = avgRating;
    const bayesianScore = (v / (v + m)) * R + (m / (v + m)) * C;

    // Recency boost
    // Simple decay: boost * (1 / (1 + daysSinceLastReview/30)) or similar?
    // The prompt says: "Add a light recency boost (e.g. up to +0.3) based on days since lastReviewAt."
    // Let's say max boost is if reviewed today. 0 boost if > 90 days.
    const now = new Date().getTime();
    const daysSince = Math.max(0, (now - stats.lastAt) / (1000 * 60 * 60 * 24));
    
    // Linear decay over 90 days
    // const recencyBoost = Math.max(0, maxRecencyBoost * (1 - daysSince / 90));
    
    // Or maybe exponential decay? Let's stick to something simple that feels right.
    // If reviewed in last 7 days => full boost?
    // Let's try a simple decay function: boost = maxBoost * e^(-days / 30)
    const recencyBoost = maxRecencyBoost * Math.exp(-daysSince / 30);

    const finalScore = bayesianScore + recencyBoost;

    return {
      tool,
      avgRating,
      reviewCount,
      lastReviewAt,
      bayesianScore,
      finalScore,
    };
  });
}

export function getTopTools(
  scores: ToolScore[],
  filterFn: (t: ToolScore) => boolean,
  limit?: number
): ToolScore[] {
  const filtered = scores.filter(filterFn);
  // Sort by finalScore descending
  filtered.sort((a, b) => b.finalScore - a.finalScore);
  
  if (limit) {
    return filtered.slice(0, limit);
  }
  return filtered;
}

/**
 * Compute tool aggregates from Supabase review aggregates
 * This is the new function that works with real Supabase data
 */
export function computeToolAggregates(
  tools: Tool[],
  reviewAggs: RawReviewAggregate[],
  options?: {
    m?: number;               // prior review count, default ~10
    maxRecencyBoost?: number; // e.g. 0.3
    recencyWindowDays?: number; // e.g. 90
  }
): ToolAggregate[] {
  const m = options?.m ?? 10;
  const maxRecencyBoost = options?.maxRecencyBoost ?? 0.3;
  const recencyWindowDays = options?.recencyWindowDays ?? 90;

  // Compute global mean C (average of avg_rating weighted by review_count)
  let totalWeightedSum = 0;
  let totalWeight = 0;
  
  for (const agg of reviewAggs) {
    totalWeightedSum += agg.avg_rating * agg.review_count;
    totalWeight += agg.review_count;
  }
  
  const C = totalWeight > 0 ? totalWeightedSum / totalWeight : 0;

  // Create a map for quick lookup
  const reviewMap = new Map<string, RawReviewAggregate>();
  for (const agg of reviewAggs) {
    reviewMap.set(agg.tool_slug, agg);
  }

  // Compute aggregates for each tool
  const aggregates: ToolAggregate[] = [];
  
  for (const tool of tools) {
    const reviewAgg = reviewMap.get(tool.slug);
    
    if (!reviewAgg || reviewAgg.review_count === 0) {
      // Skip tools with no reviews
      continue;
    }

    const avgRating = reviewAgg.avg_rating;
    const reviewCount = reviewAgg.review_count;
    const lastReviewAt = reviewAgg.last_review_at ? new Date(reviewAgg.last_review_at) : null;

    // Bayesian score: (v / (v + m)) * R + (m / (v + m)) * C
    const v = reviewCount;
    const R = avgRating;
    const bayesianScore = (v / (v + m)) * R + (m / (v + m)) * C;

    // Recency boost
    let recencyBoost = 0;
    if (lastReviewAt) {
      const now = new Date().getTime();
      const reviewTime = lastReviewAt.getTime();
      const daysSince = Math.max(0, (now - reviewTime) / (1000 * 60 * 60 * 24));
      
      if (daysSince <= recencyWindowDays) {
        recencyBoost = ((recencyWindowDays - daysSince) / recencyWindowDays) * maxRecencyBoost;
      }
    }

    const finalScore = bayesianScore + recencyBoost;

    aggregates.push({
      tool,
      avgRating,
      reviewCount,
      lastReviewAt,
      bayesianScore,
      finalScore,
    });
  }

  return aggregates;
}

/**
 * Get top tools from aggregates with filtering
 */
export function getTopToolsFromAggregates(
  aggregates: ToolAggregate[],
  filterFn: (t: ToolAggregate) => boolean,
  limit?: number,
  minReviews?: number
): ToolAggregate[] {
  let filtered = aggregates.filter(filterFn);
  
  // Filter by minimum reviews
  if (minReviews !== undefined) {
    filtered = filtered.filter(t => t.reviewCount >= minReviews);
  }
  
  // Sort by finalScore descending
  filtered.sort((a, b) => b.finalScore - a.finalScore);
  
  if (limit) {
    return filtered.slice(0, limit);
  }
  return filtered;
}

