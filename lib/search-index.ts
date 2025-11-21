import { Tool, Collection } from './types';
import { getAllTools, getAllCollections } from './data';

export interface SearchResult {
  type: 'tool' | 'category' | 'collection' | 'action' | 'persona';
  id: string;
  title: string;
  subtitle?: string;
  description?: string;
  url: string;
  icon?: string;
  badge?: string;
  keywords?: string[];
}

export function buildSearchIndex(): SearchResult[] {
  const results: SearchResult[] = [];

  const tools = getAllTools();
  tools.forEach((tool) => {
    results.push({
      type: 'tool',
      id: tool.id,
      title: tool.name,
      subtitle: tool.tagline,
      description: tool.description,
      url: `/tools/${tool.slug}`,
      icon: tool.logoUrl || undefined,
      badge: tool.category,
      keywords: [
        tool.name.toLowerCase(),
        tool.tagline.toLowerCase(),
        tool.description.toLowerCase(),
        tool.category,
        tool.pricing,
        ...tool.tags.map(t => t.toLowerCase()),
        ...tool.bestFor.map(b => b.toLowerCase()),
      ],
    });
  });

  const collections = getAllCollections();
  collections.forEach((collection) => {
    results.push({
      type: 'collection',
      id: collection.id,
      title: collection.name,
      subtitle: `${collection.toolSlugs.length} tools`,
      description: collection.description,
      url: `/collections/${collection.slug}`,
      keywords: [
        collection.name.toLowerCase(),
        collection.tagline.toLowerCase(),
        collection.description.toLowerCase(),
        collection.persona.toLowerCase(),
        ...collection.tags.map(t => t.toLowerCase()),
      ],
    });
  });

  const groups: Array<{ id: string; label: string; description: string }> = [
    { id: 'AI Productivity', label: 'AI Productivity', description: 'AI tools for productivity and workflow' },
    { id: 'AI Coding & Developer Tools', label: 'Developer Tools', description: 'AI coding assistants and dev tools' },
    { id: 'AI Design Tools', label: 'Design Tools', description: 'AI image, video, and design tools' },
    { id: 'AI Content Creation', label: 'Content Creation', description: 'AI writing and content tools' },
  ];

  groups.forEach((group) => {
    results.push({
      type: 'category',
      id: group.id,
      title: group.label,
      subtitle: group.description,
      url: `/tools?group=${encodeURIComponent(group.id)}`,
      badge: 'Group',
      keywords: [group.label.toLowerCase(), group.description.toLowerCase()],
    });
  });

  const personas = [
    { id: 'founder', label: 'Founders', description: 'Tools for startup founders' },
    { id: 'developer', label: 'Developers', description: 'Dev productivity tools' },
    { id: 'student', label: 'Students', description: 'Study and learning tools' },
    { id: 'creator', label: 'Creators', description: 'Content creation tools' },
  ];

  personas.forEach((persona) => {
    results.push({
      type: 'persona',
      id: persona.id,
      title: persona.label,
      subtitle: persona.description,
      url: `/wizard?persona=${persona.id}`,
      badge: 'Persona',
      keywords: [persona.label.toLowerCase(), persona.description.toLowerCase()],
    });
  });

  results.push(
    {
      type: 'action',
      id: 'tools',
      title: 'Browse All Tools',
      subtitle: 'Explore the complete tool directory',
      url: '/tools',
      keywords: ['tools', 'browse', 'explore', 'directory'],
    },
    {
      type: 'action',
      id: 'wizard',
      title: 'Stack Wizard',
      subtitle: 'Get personalized tool recommendations',
      url: '/wizard',
      keywords: ['wizard', 'recommendations', 'personalized', 'guide'],
    },
    {
      type: 'action',
      id: 'collections',
      title: 'View Collections',
      subtitle: 'Curated tool collections',
      url: '/collections',
      keywords: ['collections', 'stacks', 'curated'],
    },
    {
      type: 'action',
      id: 'discover',
      title: 'Discover Tools',
      subtitle: 'Find tools with AI assistance',
      url: '/discover',
      keywords: ['discover', 'ai', 'find', 'search'],
    }
  );

  return results;
}

export function searchIndex(query: string, index: SearchResult[]): SearchResult[] {
  if (!query.trim()) {
    return index.filter(item => item.type === 'action').slice(0, 5);
  }

  const searchTerm = query.toLowerCase().trim();
  const words = searchTerm.split(/\s+/);

  const scored = index.map(item => {
    let score = 0;

    if (item.title.toLowerCase().includes(searchTerm)) {
      score += 10;
    }

    if (item.title.toLowerCase().startsWith(searchTerm)) {
      score += 5;
    }

    if (item.subtitle?.toLowerCase().includes(searchTerm)) {
      score += 5;
    }

    if (item.description?.toLowerCase().includes(searchTerm)) {
      score += 3;
    }

    if (item.keywords) {
      words.forEach(word => {
        if (item.keywords!.some(k => k.includes(word))) {
          score += 2;
        }
      });
    }

    return { item, score };
  });

  return scored
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 8)
    .map(({ item }) => item);
}
