import { Tool } from './types';

export interface SmartFilter {
  type: 'category' | 'pricing' | 'tag';
  label: string;
  value: string;
}

const categoryKeywords: Record<string, string[]> = {
  writing: ['write', 'notes', 'docs', 'text', 'editor', 'document', 'content'],
  meeting: ['meet', 'call', 'video', 'conference', 'schedule', 'calendar'],
  automation: ['automate', 'workflow', 'zapier', 'integrate', 'connect'],
  planning: ['plan', 'project', 'task', 'organize', 'manage', 'timeline'],
  research: ['research', 'search', 'find', 'discover', 'explore', 'answer'],
  devtools: ['code', 'dev', 'developer', 'programming', 'git', 'ide', 'editor'],
};

const pricingKeywords: Record<string, string[]> = {
  free: ['free', 'no cost', 'zero', 'gratis'],
  freemium: ['freemium', 'free tier', 'trial'],
  paid: ['paid', 'premium', 'subscription', 'pro'],
};

export function getSmartFilters(query: string, tools: Tool[]): SmartFilter[] {
  if (!query || query.trim().length === 0) {
    return [];
  }

  const filters: SmartFilter[] = [];
  const lowerQuery = query.toLowerCase().trim();
  const words = lowerQuery.split(/\s+/);

  for (const [category, keywords] of Object.entries(categoryKeywords)) {
    const matches = keywords.some(keyword =>
      words.some(word => word.includes(keyword) || keyword.includes(word))
    );

    if (matches) {
      filters.push({
        type: 'category',
        label: category.charAt(0).toUpperCase() + category.slice(1),
        value: category,
      });
    }
  }

  for (const [pricing, keywords] of Object.entries(pricingKeywords)) {
    const matches = keywords.some(keyword => lowerQuery.includes(keyword));

    if (matches) {
      filters.push({
        type: 'pricing',
        label: pricing.charAt(0).toUpperCase() + pricing.slice(1),
        value: pricing,
      });
    }
  }

  const matchingTools = tools.filter(tool => {
    const toolText = `${tool.name} ${tool.tagline} ${tool.description} ${tool.tags.join(' ')}`.toLowerCase();
    return words.some(word => toolText.includes(word));
  });

  const tagFrequency: Record<string, number> = {};
  matchingTools.forEach(tool => {
    tool.tags.forEach(tag => {
      tagFrequency[tag] = (tagFrequency[tag] || 0) + 1;
    });
  });

  const popularTags = Object.entries(tagFrequency)
    .filter(([_, count]) => count >= 2)
    .sort(([_, a], [__, b]) => b - a)
    .slice(0, 3)
    .map(([tag]) => ({
      type: 'tag' as const,
      label: tag.charAt(0).toUpperCase() + tag.slice(1),
      value: tag,
    }));

  filters.push(...popularTags);

  const uniqueFilters = Array.from(
    new Map(filters.map(f => [`${f.type}-${f.value}`, f])).values()
  );

  return uniqueFilters.slice(0, 5);
}
