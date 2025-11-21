import { Tool, Collection } from './types';
import toolsData from '@/data/tools.json';
import collectionsData from '@/data/collections.json';

export function getAllTools(): Tool[] {
  return toolsData as Tool[];
}

export function getToolBySlug(slug: string): Tool | undefined {
  return getAllTools().find(tool => tool.slug === slug);
}

export function getToolById(id: string): Tool | undefined {
  return getAllTools().find(tool => tool.id === id);
}

export function getToolsByIds(ids: string[]): Tool[] {
  const tools = getAllTools();
  return ids.map(id => tools.find(tool => tool.id === id)).filter(Boolean) as Tool[];
}

export function getToolsBySlugs(slugs: string[]): Tool[] {
  const tools = getAllTools();
  return slugs.map(slug => tools.find(tool => tool.slug === slug)).filter(Boolean) as Tool[];
}

export function getFeaturedTools(): Tool[] {
  return getAllTools().filter(tool => tool.featured);
}

export function getToolsByCategory(category: string): Tool[] {
  return getAllTools().filter(tool => tool.category === category);
}

export function getToolsByGroup(group: string): Tool[] {
  return getAllTools().filter(tool => tool.group === group);
}

export function getAllCollections(): Collection[] {
  return collectionsData as Collection[];
}

export function getCollectionBySlug(slug: string): Collection | undefined {
  return getAllCollections().find(collection => collection.slug === slug);
}

export function getCollectionById(id: string): Collection | undefined {
  return getAllCollections().find(collection => collection.id === id);
}

export function searchTools(query: string, tools: Tool[]): Tool[] {
  if (!query.trim()) return tools;

  const searchTerm = query.toLowerCase();

  return tools.filter(tool => {
    return (
      tool.name.toLowerCase().includes(searchTerm) ||
      tool.tagline.toLowerCase().includes(searchTerm) ||
      tool.description.toLowerCase().includes(searchTerm) ||
      tool.tags.some(tag => tag.toLowerCase().includes(searchTerm)) ||
      tool.category.toLowerCase().includes(searchTerm)
    );
  });
}
