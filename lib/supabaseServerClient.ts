import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { Database } from './database.types';
import { ReviewWithProfile } from './types';

/**
 * Server-side Supabase client for use in Server Components, API routes, and Server Actions.
 * Note: For authenticated requests, you may need middleware to sync session cookies.
 * For now, this client works for public queries. Auth checks should use browser client.
 */
export function createServerClient(): SupabaseClient<Database> | null {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('Missing Supabase environment variables. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY');
    return null;
  }

  return createClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

/**
 * Create a server client with a user's access token for authenticated requests.
 * Use this when you have the user's session token (e.g., from cookies).
 */
export function createServerClientWithAuth(accessToken: string) {
  const client = createServerClient();
  if (!client) {
    throw new Error('Supabase environment variables are not configured.');
  }
  client.auth.setSession({
    access_token: accessToken,
    refresh_token: '',
  } as any);
  return client;
}

/**
 * Helper functions for common operations
 */

/**
 * Fetch all reviews for a specific tool with profile information
 */
export async function getToolReviewsWithProfiles(toolSlug: string): Promise<ReviewWithProfile[]> {
  const supabase = createServerClient();
  if (!supabase) {
    return [];
  }
  
  const { data, error } = await supabase
    .from('tool_reviews')
    .select(`
      id,
      created_at,
      user_id,
      tool_slug,
      rating,
      review_text,
      persona,
      profiles:user_id (
        display_name,
        avatar_url,
        persona
      )
    `)
    .eq('tool_slug', toolSlug)
    .order('created_at', { ascending: false });

  if (error) {
    console.error("Error fetching tool reviews", error);
    return [];
  }

  return (data ?? []).map((row: any) => ({
    review: {
      id: row.id,
      created_at: row.created_at,
      user_id: row.user_id,
      tool_slug: row.tool_slug,
      rating: row.rating,
      review_text: row.review_text,
      persona: row.persona,
    },
    profile: row.profiles ?? null,
  }));
}

export function computeReviewStats(reviews: ReviewWithProfile[]) {
  if (reviews.length === 0) {
    return { avgRating: 0, count: 0 };
  }

  const count = reviews.length;
  const sum = reviews.reduce((acc, r) => acc + (r.review.rating ?? 0), 0);

  return {
    avgRating: sum / count,
    count,
  };
}

/**
 * Fetch all reviews for a specific tool (legacy - use getToolReviewsWithProfiles)
 */
export async function getToolReviews(toolSlug: string) {
  return getToolReviewsWithProfiles(toolSlug);
}

/**
 * Get a user's review for a specific tool
 */
export async function getUserToolReview(userId: string, toolSlug: string) {
  const supabase = createServerClient();
  if (!supabase) {
    return null;
  }
  
  const { data, error } = await supabase
    .from('tool_reviews')
    .select('*')
    .eq('user_id', userId)
    .eq('tool_slug', toolSlug)
    .single();

  if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
    throw new Error(`Failed to fetch review: ${error.message}`);
  }

  return data;
}

/**
 * Insert or update a user's review for a tool
 */
export async function upsertToolReview(
  userId: string,
  toolSlug: string,
  review: {
    rating: number;
    review_text?: string;
    persona?: string;
  }
) {
  const supabase = createServerClient();
  if (!supabase) {
    throw new Error('Supabase environment variables are not configured.');
  }
  
  const { data, error } = await supabase
    .from('tool_reviews')
    .upsert({
      user_id: userId,
      tool_slug: toolSlug,
      rating: review.rating,
      review_text: review.review_text || null,
      persona: review.persona || null,
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to upsert review: ${error.message}`);
  }

  return data;
}

/**
 * Get all stacks for a user (including private ones)
 */
export async function getUserStacks(userId: string) {
  const supabase = createServerClient();
  if (!supabase) {
    return [];
  }
  
  const { data, error } = await supabase
    .from('user_stacks')
    .select('*, stack_items(*)')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch stacks: ${error.message}`);
  }

  return data;
}

/**
 * Get a single stack with its items
 */
export async function getStackWithItems(stackId: string) {
  const supabase = createServerClient();
  if (!supabase) {
    return null;
  }
  
  const { data, error } = await supabase
    .from('user_stacks')
    .select('*, stack_items(*)')
    .eq('id', stackId)
    .single();

  if (error) {
    throw new Error(`Failed to fetch stack: ${error.message}`);
  }

  return data;
}

/**
 * Get public stacks (for discovery)
 */
export async function getPublicStacks(limit = 10) {
  const supabase = createServerClient();
  if (!supabase) {
    return [];
  }
  
  const { data, error } = await supabase
    .from('user_stacks')
    .select('*, stack_items(*), profiles:user_id(display_name, avatar_url)')
    .eq('visibility', 'public')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    throw new Error(`Failed to fetch public stacks: ${error.message}`);
  }

  return data;
}

/**
 * Raw review aggregate from Supabase
 */
export interface RawReviewAggregate {
  tool_slug: string;
  avg_rating: number;
  review_count: number;
  last_review_at: string | null;
}

/**
 * Fetch review aggregates from Supabase for leaderboard scoring
 */
export async function getReviewAggregates(): Promise<RawReviewAggregate[]> {
  const supabase = createServerClient();
  if (!supabase) {
    console.warn('Supabase not configured, returning empty review aggregates');
    return [];
  }

  const { data, error } = await supabase
    .from('tool_reviews')
    .select('tool_slug, rating, created_at');

  if (error) {
    console.error('Error fetching review aggregates', error);
    return [];
  }

  if (!data || data.length === 0) {
    return [];
  }

  // Aggregate reviews by tool_slug
  const aggregatesMap = new Map<string, { sum: number; count: number; lastAt: string | null }>();

  for (const review of data) {
    const slug = review.tool_slug;
    const existing = aggregatesMap.get(slug) || { sum: 0, count: 0, lastAt: null };
    
    existing.sum += review.rating;
    existing.count += 1;
    
    const reviewDate = review.created_at;
    if (!existing.lastAt || (reviewDate && reviewDate > existing.lastAt)) {
      existing.lastAt = reviewDate;
    }
    
    aggregatesMap.set(slug, existing);
  }

  // Convert to array format
  const aggregates: RawReviewAggregate[] = Array.from(aggregatesMap.entries()).map(([tool_slug, stats]) => ({
    tool_slug,
    avg_rating: stats.sum / stats.count,
    review_count: stats.count,
    last_review_at: stats.lastAt,
  }));

  return aggregates;
}

