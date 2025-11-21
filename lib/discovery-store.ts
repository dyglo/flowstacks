import { create } from 'zustand';
import { SearchResult } from './types';

export interface DiscoveryArticle extends SearchResult {
  id: string;
  timestamp: number;
}

interface DiscoveryStore {
  articles: Map<string, DiscoveryArticle>;
  currentArticle: DiscoveryArticle | null;
  
  // Search state persistence
  searchQuery: string;
  searchResults: SearchResult[];
  
  // Actions
  addArticle: (article: SearchResult) => string;
  getArticle: (id: string) => DiscoveryArticle | null;
  setCurrentArticle: (id: string) => void;
  clearCurrent: () => void;
  
  // Search state actions
  setSearchState: (query: string, results: SearchResult[]) => void;
  clearSearchState: () => void;
}

/**
 * Zustand store for managing discovery articles
 * Used to pass article data between Discovery page and Reader view
 */
export const useDiscoveryStore = create<DiscoveryStore>((set, get) => ({
  articles: new Map(),
  currentArticle: null,
  searchQuery: '',
  searchResults: [],

  addArticle: (article: SearchResult) => {
    const id = generateArticleId(article);
    const discoveryArticle: DiscoveryArticle = {
      ...article,
      id,
      timestamp: Date.now(),
    };

    set(state => {
      const newArticles = new Map(state.articles);
      newArticles.set(id, discoveryArticle);
      
      // Keep only last 50 articles to prevent memory bloat
      if (newArticles.size > 50) {
        const oldestId = Array.from(newArticles.entries())
          .sort((a, b) => a[1].timestamp - b[1].timestamp)[0][0];
        newArticles.delete(oldestId);
      }
      
      return { articles: newArticles };
    });

    return id;
  },

  getArticle: (id: string) => {
    return get().articles.get(id) || null;
  },

  setCurrentArticle: (id: string) => {
    const article = get().articles.get(id);
    if (article) {
      set({ currentArticle: article });
    }
  },

  clearCurrent: () => {
    set({ currentArticle: null });
  },

  setSearchState: (query: string, results: SearchResult[]) => {
    set({ searchQuery: query, searchResults: results });
  },

  clearSearchState: () => {
    set({ searchQuery: '', searchResults: [] });
  },
}));

/**
 * Generate a stable ID for an article based on URL
 */
function generateArticleId(article: SearchResult): string {
  // Use URL as base for ID (stable across sessions)
  const urlHash = btoa(article.url)
    .replace(/[^a-zA-Z0-9]/g, '')
    .substring(0, 16);
  return `article_${urlHash}`;
}

