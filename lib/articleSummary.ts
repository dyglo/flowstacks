export interface ArticleForSummary {
  title: string;
  url: string;
  snippet: string;
  source?: string;
}

interface SummaryResult {
  summary: string;
  isLocalFallback: boolean;
}

/**
 * Get AI-powered summary of an article
 * 
 * Currently uses local heuristics, but designed to support remote LLM calls.
 * Future: Integrate with GPT-4o API for high-quality summaries.
 * 
 * @param article - Article metadata to summarize
 * @returns Promise<string> - Generated summary text
 */
export async function getArticleSummary(
  article: ArticleForSummary
): Promise<string> {
  // Check if remote summaries are enabled
  const useRemoteSummaries = process.env.NEXT_PUBLIC_USE_REMOTE_SUMMARIES === 'true';
  const openAiApiKey = process.env.OPENAI_API_KEY;

  if (useRemoteSummaries && openAiApiKey) {
    try {
      // TODO: Implement remote GPT-4o summarization
      // This will call /api/summarize route with article data
      // 
      // Example implementation:
      // const response = await fetch('/api/summarize', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({
      //     title: article.title,
      //     snippet: article.snippet,
      //     url: article.url,
      //   }),
      // });
      // 
      // if (!response.ok) {
      //   throw new Error('Summarization API failed');
      // }
      // 
      // const data = await response.json();
      // return data.summary;

      console.log('[ArticleSummary] Remote summaries configured but not yet implemented');
      // Fall through to local heuristic
    } catch (error) {
      console.error('[ArticleSummary] Remote summary failed, using fallback:', error);
      // Fall through to local heuristic
    }
  }

  // Local heuristic-based summary (current implementation)
  const result = generateLocalSummary(article);
  return result.summary;
}

/**
 * Generate a summary using local heuristics
 * This is the fallback when remote LLM is not available
 */
function generateLocalSummary(article: ArticleForSummary): SummaryResult {
  const { title, snippet, source } = article;

  // Detect topic/category from title
  const topic = detectTopicFromTitle(title);
  
  // Detect content type from source/title
  const contentType = detectContentType(title, source);

  // Build a pseudo-summary
  let summary = '';

  // Opening based on content type
  if (contentType === 'listicle') {
    summary += `This article presents a curated list focused on ${topic}. `;
  } else if (contentType === 'review') {
    summary += `This review examines ${topic} in detail. `;
  } else if (contentType === 'guide') {
    summary += `This comprehensive guide explores ${topic}. `;
  } else if (contentType === 'comparison') {
    summary += `This comparison analyzes different options for ${topic}. `;
  } else {
    summary += `This article discusses ${topic}. `;
  }

  // Extract key insights from snippet
  const snippetSummary = summarizeSnippet(snippet);
  summary += snippetSummary;

  // Add source credibility hint
  if (source) {
    const sourceType = categorizeSource(source);
    if (sourceType === 'tech-blog') {
      summary += ' Published on a reputable technology blog.';
    } else if (sourceType === 'news') {
      summary += ' From a technology news source.';
    } else if (sourceType === 'official') {
      summary += ' From an official product or company source.';
    }
  }

  return {
    summary: summary.trim(),
    isLocalFallback: true,
  };
}

/**
 * Detect main topic from article title
 */
function detectTopicFromTitle(title: string): string {
  const titleLower = title.toLowerCase();

  const topicPatterns: Record<string, string[]> = {
    'AI coding tools and assistants': ['coding', 'code', 'developer', 'programming', 'ide', 'copilot'],
    'AI productivity software': ['productivity', 'workflow', 'automation', 'efficiency'],
    'AI writing and content tools': ['writing', 'content', 'copywriting', 'grammar', 'editor'],
    'AI meeting and communication tools': ['meeting', 'video', 'transcription', 'call', 'conference'],
    'AI image generation and design': ['image', 'design', 'art', 'visual', 'graphic', 'photo'],
    'AI research and analysis tools': ['research', 'analysis', 'data', 'analytics', 'insight'],
    'AI project management': ['project', 'management', 'planning', 'task', 'organization'],
  };

  for (const [topic, keywords] of Object.entries(topicPatterns)) {
    if (keywords.some(kw => titleLower.includes(kw))) {
      return topic;
    }
  }

  return 'AI tools and technologies';
}

/**
 * Detect content type (listicle, review, guide, etc.)
 */
function detectContentType(title: string, source?: string): string {
  const titleLower = title.toLowerCase();

  if (/^\d+\s+(best|top|essential|must-have)/i.test(title)) {
    return 'listicle';
  }
  if (titleLower.includes('review') || titleLower.includes('tested')) {
    return 'review';
  }
  if (titleLower.includes('guide') || titleLower.includes('how to')) {
    return 'guide';
  }
  if (titleLower.includes('vs') || titleLower.includes('comparison') || titleLower.includes('compared')) {
    return 'comparison';
  }

  return 'article';
}

/**
 * Summarize snippet intelligently
 */
function summarizeSnippet(snippet: string): string {
  // Truncate to reasonable length
  const maxLength = 150;
  
  if (snippet.length <= maxLength) {
    return snippet;
  }

  // Find last sentence boundary within limit
  const truncated = snippet.substring(0, maxLength);
  const lastPeriod = truncated.lastIndexOf('.');
  const lastQuestion = truncated.lastIndexOf('?');
  const lastExclamation = truncated.lastIndexOf('!');
  
  const lastSentence = Math.max(lastPeriod, lastQuestion, lastExclamation);
  
  if (lastSentence > 50) {
    return snippet.substring(0, lastSentence + 1);
  }

  // If no good sentence boundary, truncate at word
  const lastSpace = truncated.lastIndexOf(' ');
  return snippet.substring(0, lastSpace) + '...';
}

/**
 * Categorize source domain for credibility hints
 */
function categorizeSource(source: string): string {
  const sourceLower = source.toLowerCase();

  const techBlogs = ['techcrunch', 'theverge', 'wired', 'arstechnica', 'zdnet', 'cnet'];
  const newsSites = ['bbc', 'cnn', 'reuters', 'bloomberg', 'forbes'];
  const officialDomains = ['.ai', 'openai', 'anthropic', 'google', 'microsoft', 'github'];

  if (techBlogs.some(blog => sourceLower.includes(blog))) {
    return 'tech-blog';
  }
  if (newsSites.some(news => sourceLower.includes(news))) {
    return 'news';
  }
  if (officialDomains.some(domain => sourceLower.includes(domain))) {
    return 'official';
  }

  return 'general';
}

/**
 * Validate summary quality (for future use)
 */
export function validateSummary(summary: string): boolean {
  return summary.length > 20 && summary.length < 500;
}

