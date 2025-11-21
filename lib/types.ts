import { Database } from './database.types';

export type PricingModel = 'free' | 'freemium' | 'paid';

export interface Tool {
  id: string;
  name: string;
  slug: string;
  tagline: string;
  description: string;
  category: string;
  group: string;
  pricing: PricingModel;
  websiteUrl: string;
  productHuntUrl?: string | null;
  logoUrl?: string | null;
  tags: string[];
  bestFor: string[];
  platforms: string[];
  featured?: boolean;
}

export interface Collection {
  id: string;
  name: string;
  slug: string;
  tagline: string;
  description: string;
  persona: string;
  tags: string[];
  toolSlugs: string[];
  featured?: boolean;
}

export interface SearchResult {
  title: string;
  url: string;
  snippet: string;
  favicon?: string;
  source?: string;
}

export type SearchProvider = 'serper' | 'serpapi';

type ToolReviewRow = Database["public"]["Tables"]["tool_reviews"]["Row"];
type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];

export interface ReviewWithProfile {
  review: ToolReviewRow;
  profile: Pick<ProfileRow, "display_name" | "avatar_url" | "persona"> | null;
}
