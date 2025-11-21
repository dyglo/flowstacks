
export interface ToolReview {
  toolSlug: string;
  rating: number; // 1-5
  createdAt: string; // ISO string
}

// TODO: replace mockReviews with Supabase tool_reviews once Auth + DB are wired.
export const mockReviews: ToolReview[] = [
  // ChatGPT reviews
  { toolSlug: "chatgpt", rating: 5, createdAt: "2023-10-01T10:00:00Z" },
  { toolSlug: "chatgpt", rating: 5, createdAt: "2023-10-02T11:00:00Z" },
  { toolSlug: "chatgpt", rating: 4, createdAt: "2023-10-05T09:30:00Z" },
  { toolSlug: "chatgpt", rating: 5, createdAt: "2023-10-10T14:00:00Z" },
  { toolSlug: "chatgpt", rating: 5, createdAt: "2023-10-15T16:45:00Z" },
  { toolSlug: "chatgpt", rating: 4, createdAt: "2023-11-01T08:15:00Z" },

  // GitHub Copilot reviews
  { toolSlug: "github-copilot", rating: 5, createdAt: "2023-09-15T10:00:00Z" },
  { toolSlug: "github-copilot", rating: 4, createdAt: "2023-09-20T12:00:00Z" },
  { toolSlug: "github-copilot", rating: 5, createdAt: "2023-10-01T09:00:00Z" },
  { toolSlug: "github-copilot", rating: 5, createdAt: "2023-10-05T15:30:00Z" },
  { toolSlug: "github-copilot", rating: 3, createdAt: "2023-10-20T11:45:00Z" },
  { toolSlug: "github-copilot", rating: 5, createdAt: "2023-11-10T14:20:00Z" },

  // Cursor reviews (Newer, so maybe fewer but higher ratings recently)
  { toolSlug: "cursor", rating: 5, createdAt: "2023-10-25T10:00:00Z" },
  { toolSlug: "cursor", rating: 5, createdAt: "2023-11-05T13:00:00Z" },
  { toolSlug: "cursor", rating: 5, createdAt: "2023-11-12T09:00:00Z" },
  { toolSlug: "cursor", rating: 5, createdAt: "2023-11-18T16:00:00Z" },
  { toolSlug: "cursor", rating: 4, createdAt: "2023-11-19T11:30:00Z" },

  // Midjourney reviews
  { toolSlug: "midjourney", rating: 5, createdAt: "2023-08-01T10:00:00Z" },
  { toolSlug: "midjourney", rating: 5, createdAt: "2023-08-15T14:00:00Z" },
  { toolSlug: "midjourney", rating: 5, createdAt: "2023-09-01T09:30:00Z" },
  { toolSlug: "midjourney", rating: 4, createdAt: "2023-09-20T11:00:00Z" },
  { toolSlug: "midjourney", rating: 5, createdAt: "2023-10-10T15:45:00Z" },
  
  // Claude
  { toolSlug: "claude", rating: 5, createdAt: "2023-10-05T10:00:00Z" },
  { toolSlug: "claude", rating: 4, createdAt: "2023-10-12T14:00:00Z" },
  { toolSlug: "claude", rating: 5, createdAt: "2023-11-01T09:00:00Z" },
  
  // Notion AI
  { toolSlug: "notion-ai", rating: 4, createdAt: "2023-09-10T10:00:00Z" },
  { toolSlug: "notion-ai", rating: 3, createdAt: "2023-09-25T14:00:00Z" },
  { toolSlug: "notion-ai", rating: 5, createdAt: "2023-10-15T09:00:00Z" },
  { toolSlug: "notion-ai", rating: 4, createdAt: "2023-11-05T16:00:00Z" },
  
  // Perplexity
  { toolSlug: "perplexity", rating: 5, createdAt: "2023-10-01T10:00:00Z" },
  { toolSlug: "perplexity", rating: 5, createdAt: "2023-10-20T14:00:00Z" },
  { toolSlug: "perplexity", rating: 5, createdAt: "2023-11-10T09:00:00Z" },
];

