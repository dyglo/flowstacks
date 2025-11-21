import { Tool } from './types';

export interface DiscoveryArticle {
  title: string;
  snippet: string;
  url: string;
  source?: string;
}

export interface MatchOptions {
  maxResults?: number;
  minScore?: number;
}

interface ScoredTool {
  tool: Tool;
  score: number;
  matchReasons: string[];
}

/**
 * Advanced scoring-based tool matcher for discovery articles
 * Uses weighted scoring across multiple dimensions:
 * - Exact name matches (highest priority)
 * - Slug matches
 * - Tag overlaps
 * - Category/group hints
 * - Domain-specific brand hints
 */
export function matchToolsToArticle(
  article: DiscoveryArticle,
  tools: Tool[],
  options: MatchOptions = {}
): Tool[] {
  const {
    maxResults = 6,
    minScore = 1.5, // Lowered threshold for better matches
  } = options;

  const titleLower = article.title.toLowerCase();
  const snippetLower = article.snippet.toLowerCase();
  const combinedText = `${titleLower} ${snippetLower}`;
  const sourceDomain = article.source?.toLowerCase() || extractDomain(article.url);

  const scoredTools: ScoredTool[] = [];

  for (const tool of tools) {
    let score = 0;
    const matchReasons: string[] = [];

    const toolNameLower = tool.name.toLowerCase();
    const toolSlugLower = tool.slug.toLowerCase();

    // ===== 1. EXACT NAME MATCHES (Highest Priority) =====
    // +5 for exact name in title
    if (titleLower.includes(toolNameLower)) {
      score += 5;
      matchReasons.push(`name in title`);
    }

    // +3 for exact name in snippet
    if (snippetLower.includes(toolNameLower)) {
      score += 3;
      matchReasons.push(`name in snippet`);
    }

    // ===== 2. SLUG MATCHES =====
    // +2 for slug match (e.g., "github-copilot" in text)
    if (combinedText.includes(toolSlugLower)) {
      score += 2;
      matchReasons.push(`slug match`);
    }

    // ===== 3. TAG MATCHES =====
    // +1 per matching tag (up to 3 tags counted to avoid over-weighting)
    let tagMatches = 0;
    for (const tag of tool.tags) {
      if (tagMatches >= 3) break; // Cap tag bonus
      const tagLower = tag.toLowerCase();
      if (combinedText.includes(tagLower)) {
        score += 1;
        tagMatches++;
      }
    }
    if (tagMatches > 0) {
      matchReasons.push(`${tagMatches} tag match${tagMatches > 1 ? 'es' : ''}`);
    }

    // ===== 4. CATEGORY/GROUP HINTS =====
    // +1 for category match
    const categoryLower = tool.category.toLowerCase();
    if (combinedText.includes(categoryLower)) {
      score += 1;
      matchReasons.push(`category hint`);
    }

    // Special category boosts based on article keywords
    const categoryKeywords: Record<string, string[]> = {
      'Development Tools': ['coding', 'developer', 'programming', 'code', 'github', 'git', 'ide', 'editor', 'assistant'],
      'Writing & Communication': ['writing', 'write', 'email', 'communication', 'content', 'blog', 'grammar'],
      'Meeting & Scheduling': ['meeting', 'schedule', 'calendar', 'video call', 'zoom', 'conference'],
      'Automation & Workflows': ['automation', 'workflow', 'integrate', 'zapier', 'automate'],
      'Planning & Management': ['planning', 'project', 'management', 'task', 'organize', 'productivity'],
      'Research & Analysis': ['research', 'analyze', 'data', 'insight', 'analytics'],
    };

    const categoryHints = categoryKeywords[tool.category] || [];
    let categoryBoost = 0;
    for (const hint of categoryHints) {
      if (combinedText.includes(hint.toLowerCase())) {
        categoryBoost = 2; // Increased from 0.5 to 2 for better category matching
        break;
      }
    }
    
    // If article is clearly about tools in this category, give extra boost
    if (categoryBoost > 0 && (combinedText.includes('tool') || combinedText.includes('best') || combinedText.includes('top'))) {
      score += categoryBoost;
      if (tool.featured) {
        score += 1; // Extra boost for featured tools in relevant categories
      }
      matchReasons.push(`category match`);
    } else if (categoryBoost > 0) {
      score += categoryBoost * 0.5;
    }

    // ===== 5. DOMAIN-SPECIFIC BRAND HINTS =====
    // +2 for domain/brand correlation
    const brandHints: Record<string, string[]> = {
      'github': ['github-copilot', 'copilot'],
      'openai': ['chatgpt', 'gpt', 'dall-e', 'whisper'],
      'anthropic': ['claude'],
      'google': ['gemini', 'bard'],
      'notion': ['notion', 'notion-ai'],
      'grammarly': ['grammarly'],
      'jasper': ['jasper'],
      'cursor': ['cursor'],
      'midjourney': ['midjourney'],
      'runway': ['runway', 'runway-ml'],
      'zapier': ['zapier'],
      'perplexity': ['perplexity'],
      'otter': ['otter', 'otter-ai'],
      'fireflies': ['fireflies'],
    };

    for (const [domain, brandSlugs] of Object.entries(brandHints)) {
      if (sourceDomain.includes(domain)) {
        if (brandSlugs.some(slug => toolSlugLower.includes(slug) || slug.includes(toolSlugLower))) {
          score += 2;
          matchReasons.push(`domain hint: ${domain}`);
          break;
        }
      }
    }

    // ===== 6. PARTIAL WORD MATCHES =====
    // +1 for significant partial matches (words > 4 chars)
    const toolNameWords = toolNameLower.split(/[\s\-]+/).filter(w => w.length > 4);
    for (const word of toolNameWords) {
      if (combinedText.includes(word)) {
        score += 0.5;
        break; // Only count once
      }
    }

    // Store scored tool if it has any matches
    if (score > 0) {
      scoredTools.push({ tool, score, matchReasons });
    }
  }

  // Filter by minimum score, sort by score descending, and limit results
  const matchedTools = scoredTools
    .filter(st => st.score >= minScore)
    .sort((a, b) => {
      // Sort by score first, then by featured status
      if (Math.abs(a.score - b.score) < 0.1) {
        if (a.tool.featured && !b.tool.featured) return -1;
        if (!a.tool.featured && b.tool.featured) return 1;
      }
      return b.score - a.score;
    })
    .slice(0, maxResults)
    .map(st => st.tool);

  // If no matches found but article is clearly about AI tools, return featured tools from detected category
  if (matchedTools.length === 0 && (combinedText.includes('ai tool') || combinedText.includes('best') || combinedText.includes('top'))) {
    const detectedCategory = detectArticleCategory(combinedText);
    if (detectedCategory) {
      const categoryTools = tools
        .filter(t => t.category === detectedCategory && t.featured)
        .slice(0, maxResults);
      if (categoryTools.length > 0) {
        return categoryTools;
      }
    }
    // Fallback to any featured tools
    return tools.filter(t => t.featured).slice(0, maxResults);
  }

  return matchedTools;
}

/**
 * Detect the primary category from article content
 */
function detectArticleCategory(text: string): string | null {
  const categoryPatterns: Record<string, string[]> = {
    'Development Tools': ['coding', 'code', 'developer', 'programming', 'github', 'copilot'],
    'Writing & Communication': ['writing', 'content', 'grammar', 'email', 'copywriting'],
    'Meeting & Scheduling': ['meeting', 'video', 'conference', 'schedule', 'calendar'],
    'Planning & Management': ['project', 'management', 'task', 'planning', 'productivity'],
    'Research & Analysis': ['research', 'analysis', 'data', 'analytics'],
    'Automation & Workflows': ['automation', 'workflow', 'zapier', 'integration'],
  };

  let bestCategory: string | null = null;
  let maxMatches = 0;

  for (const [category, keywords] of Object.entries(categoryPatterns)) {
    const matches = keywords.filter(kw => text.includes(kw)).length;
    if (matches > maxMatches) {
      maxMatches = matches;
      bestCategory = category;
    }
  }

  return maxMatches > 0 ? bestCategory : null;
}

/**
 * Extract domain from URL
 */
function extractDomain(url: string): string {
  try {
    return new URL(url).hostname.replace('www.', '').toLowerCase();
  } catch {
    return '';
  }
}

/**
 * Get match quality descriptor for UI display
 */
export function getMatchQuality(score: number): 'high' | 'medium' | 'low' {
  if (score >= 8) return 'high';
  if (score >= 5) return 'medium';
  return 'low';
}

