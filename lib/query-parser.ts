export interface ParsedQuery {
  searchTerms: string;
  category?: string;
  intent: 'discover' | 'compare' | 'find-best' | 'general';
}

export function parseNaturalQuery(query: string): ParsedQuery {
  const lowerQuery = query.toLowerCase();

  const categoryKeywords: Record<string, string[]> = {
    coding: ['coding', 'code', 'programming', 'developer', 'development', 'ide'],
    writing: ['writing', 'write', 'content', 'blog', 'article', 'editor'],
    meeting: ['meeting', 'video', 'conference', 'zoom', 'call'],
    automation: ['automation', 'automate', 'workflow', 'integrate'],
    planning: ['planning', 'plan', 'schedule', 'calendar', 'organize'],
    research: ['research', 'study', 'learn', 'academic', 'paper'],
    productivity: ['productivity', 'productive', 'efficient', 'time management'],
  };

  let detectedCategory: string | undefined;
  for (const [category, keywords] of Object.entries(categoryKeywords)) {
    if (keywords.some(keyword => lowerQuery.includes(keyword))) {
      detectedCategory = category;
      break;
    }
  }

  let intent: ParsedQuery['intent'] = 'general';
  if (lowerQuery.includes('best') || lowerQuery.includes('top')) {
    intent = 'find-best';
  } else if (lowerQuery.includes('compare') || lowerQuery.includes('vs')) {
    intent = 'compare';
  } else if (lowerQuery.includes('find') || lowerQuery.includes('search') || lowerQuery.includes('look for')) {
    intent = 'discover';
  }

  const enhancedSearchTerms = detectedCategory
    ? `${detectedCategory} AI tools productivity ${query}`
    : `AI productivity tools ${query}`;

  return {
    searchTerms: enhancedSearchTerms,
    category: detectedCategory,
    intent,
  };
}
