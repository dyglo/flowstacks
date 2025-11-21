'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Loader2, Sparkles, Clock, TrendingUp, Zap, Code, MessageSquare, Calendar, Lightbulb, BarChart } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { SearchResult } from '@/lib/types';
import { parseNaturalQuery } from '@/lib/query-parser';
import { DiscoveryPreviewDrawer } from '@/components/discovery/discovery-preview-drawer';
import { useDiscoveryStore } from '@/lib/discovery-store';

const popularSearches = [
  'Best AI coding assistants',
  'Productivity tools for teams',
  'AI writing tools',
  'Meeting automation software',
  'Project management AI',
];

const quickCategories = [
  { name: 'Development', icon: Code, color: 'from-cyan-500/20 to-blue-500/20', textColor: 'text-cyan-500', query: 'best coding tools for developers' },
  { name: 'Writing', icon: MessageSquare, color: 'from-blue-500/20 to-purple-500/20', textColor: 'text-blue-500', query: 'AI writing and content tools' },
  { name: 'Meetings', icon: Calendar, color: 'from-green-500/20 to-emerald-500/20', textColor: 'text-green-500', query: 'meeting automation tools' },
  { name: 'Productivity', icon: Zap, color: 'from-yellow-500/20 to-orange-500/20', textColor: 'text-yellow-500', query: 'productivity and workflow tools' },
  { name: 'Analytics', icon: BarChart, color: 'from-pink-500/20 to-rose-500/20', textColor: 'text-pink-500', query: 'AI analytics and insights' },
  { name: 'Creative', icon: Lightbulb, color: 'from-purple-500/20 to-pink-500/20', textColor: 'text-purple-500', query: 'creative AI tools' },
];

export default function DiscoverPage() {
  // Get persistent search state from store
  const searchQuery = useDiscoveryStore(state => state.searchQuery);
  const searchResults = useDiscoveryStore(state => state.searchResults);
  const setSearchState = useDiscoveryStore(state => state.setSearchState);

  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resultCount, setResultCount] = useState(0);
  const [selectedResult, setSelectedResult] = useState<SearchResult | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [rotatingIndex, setRotatingIndex] = useState(0);

  // Restore search state on mount
  useEffect(() => {
    if (searchResults.length > 0) {
      setQuery(searchQuery);
      setResults(searchResults);
      setResultCount(searchResults.length);
    }
  }, []); // Only run on mount

  // Rotate example queries
  useEffect(() => {
    const examples = [
      'best coding tools for developers',
      'AI productivity assistants',
      'meeting transcription software',
      'project management tools',
    ];
    
    const interval = setInterval(() => {
      setRotatingIndex((prev) => (prev + 1) % examples.length);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!query.trim()) {
      return;
    }

    setLoading(true);
    setError(null);
    setResults([]);

    try {
      const parsedQuery = parseNaturalQuery(query);
      const searchTerms = parsedQuery.searchTerms;

      const response = await fetch(
        `/api/discover?query=${encodeURIComponent(searchTerms)}&provider=serper`
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to perform search');
      }

      const resultsData = data.results || [];
      setResults(resultsData);
      setResultCount(resultsData.length);
      
      // Persist search state to store
      setSearchState(query, resultsData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickSearch = (searchQuery: string) => {
    setQuery(searchQuery);
    // Trigger search
    const form = document.querySelector('form');
    if (form) {
      form.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
    }
  };

  const isToolCandidate = (result: SearchResult): boolean => {
    const searchTerms = ['ai', 'tool', 'productivity', 'app', 'software', 'platform', 'assistant', 'code', 'coding'];
    const text = `${result.title} ${result.snippet}`.toLowerCase();
    return searchTerms.some(term => text.includes(term));
  };

  const extractDomain = (url: string): string => {
    try {
      return new URL(url).hostname.replace('www.', '');
    } catch {
      return url;
    }
  };

  const handleResultClick = (result: SearchResult) => {
    setSelectedResult(result);
    setIsDrawerOpen(true);
  };

  const examples = [
    'best coding tools for developers',
    'AI productivity assistants',
    'meeting transcription software',
    'project management tools',
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section with Gradient */}
      <div className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-background border-b">
        {/* Decorative Elements */}
        <div className="absolute inset-0 bg-grid-white/5 [mask-image:radial-gradient(white,transparent_85%)]" />
        <div className="absolute top-20 right-20 w-72 h-72 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
        
        <div className="container max-w-7xl mx-auto px-4 py-16 md:py-24 relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-4xl mx-auto mb-12"
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6"
            >
              <TrendingUp className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-primary">Discover AI Tools Across the Web</span>
            </motion.div>

            {/* Main Heading */}
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-transparent">
              Find the Perfect AI Tool
            </h1>

            {/* Animated Subtitle */}
            <div className="text-xl md:text-2xl text-muted-foreground mb-4 h-8 flex items-center justify-center">
              <span className="mr-2">Search for</span>
              <AnimatePresence mode="wait">
                <motion.span
                  key={rotatingIndex}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.5 }}
                  className="font-semibold text-primary inline-block"
                >
                  "{examples[rotatingIndex]}"
                </motion.span>
              </AnimatePresence>
            </div>

            <p className="text-base text-muted-foreground mb-10">
              Real-time search powered by AI • 1000+ tools indexed • Natural language queries
            </p>

            {/* Search Bar */}
            <form onSubmit={handleSearch}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.6 }}
                className="relative max-w-3xl mx-auto"
              >
                <div className="relative group">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/50 to-blue-500/50 rounded-2xl blur opacity-0 group-hover:opacity-100 transition duration-500" />
                  <div className="relative flex gap-2 bg-background rounded-2xl border-2 border-primary/20 shadow-xl p-2">
                    <div className="relative flex-1">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                      <Input
                        type="text"
                        placeholder="E.g., Find me the best coding tools for developers..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        className="pl-12 h-14 text-base border-0 focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent"
                        disabled={loading}
                      />
                    </div>
                    <Button
                      type="submit"
                      size="lg"
                      disabled={loading}
                      className="h-14 px-8 rounded-xl"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                          Searching
                        </>
                      ) : (
                        <>
                          <Search className="mr-2 h-5 w-5" />
                          Search
                        </>
                      )}
                    </Button>
                  </div>
                </div>

                {/* Popular Searches */}
                {!results.length && !loading && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="flex flex-wrap items-center justify-center gap-2 mt-6"
                  >
                    <span className="text-sm text-muted-foreground">Popular:</span>
                    {popularSearches.map((search, index) => (
                      <button
                        key={index}
                        onClick={() => handleQuickSearch(search)}
                        className="text-sm px-3 py-1 rounded-full bg-muted/50 hover:bg-muted transition-colors border border-border/50 hover:border-primary/50 hover:text-primary"
                      >
                        {search}
                      </button>
                    ))}
                  </motion.div>
                )}
              </motion.div>
            </form>
          </motion.div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container max-w-7xl mx-auto px-4 py-8">
        {/* Error State */}
        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-6"
          >
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 text-destructive">
              <p className="text-sm">{error}</p>
            </div>
          </motion.div>
        )}

        {/* Results */}
        {results.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                <p className="text-sm text-muted-foreground">
                  Found <span className="font-semibold text-foreground text-base">{resultCount}</span> results
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {results.map((result, index) => {
                const isPotentialTool = isToolCandidate(result);
                const domain = extractDomain(result.url);

                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className="group cursor-pointer"
                    onClick={() => handleResultClick(result)}
                  >
                    <div className="h-full bg-card border rounded-xl p-5 hover:border-primary/50 transition-all hover:shadow-lg hover:shadow-primary/5">
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-base leading-tight mb-1.5 group-hover:text-primary transition-colors line-clamp-2">
                            {result.title}
                          </h3>
                          <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                            <span className="truncate">{domain}</span>
                          </p>
                        </div>
                        <Sparkles className="h-4 w-4 text-muted-foreground flex-shrink-0 group-hover:text-primary group-hover:fill-primary/20 transition-all" />
                      </div>

                      <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3 mb-3">
                        {result.snippet}
                      </p>

                      <div className="flex items-center gap-2">
                        {isPotentialTool && (
                          <Badge variant="secondary" className="text-xs gap-1">
                            <Sparkles className="h-3 w-3" />
                            Tool Candidate
                          </Badge>
                        )}
                        <Badge variant="outline" className="text-xs gap-1">
                          <Clock className="h-3 w-3" />
                          Recent
                        </Badge>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Empty State with Categories */}
        {!loading && !error && results.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="py-12"
          >
            {/* Quick Categories */}
            <div className="mb-16">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold mb-2">Browse by Category</h2>
                <p className="text-muted-foreground">Quick access to popular AI tool categories</p>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {quickCategories.map((category, index) => {
                  const Icon = category.icon;
                  return (
                    <motion.div
                      key={category.name}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Card
                        className="group cursor-pointer hover:border-primary/50 transition-all hover:shadow-lg overflow-hidden"
                        onClick={() => handleQuickSearch(category.query)}
                      >
                        <CardContent className="p-6 text-center">
                          <div className={`mx-auto w-12 h-12 rounded-xl bg-gradient-to-br ${category.color} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                            <Icon className={`h-6 w-6 ${category.textColor}`} />
                          </div>
                          <h3 className="font-semibold text-sm group-hover:text-primary transition-colors">
                            {category.name}
                          </h3>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {/* Stats Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              <Card className="border-dashed">
                <CardContent className="pt-6 text-center">
                  <div className="text-3xl font-bold text-primary mb-2">1000+</div>
                  <p className="text-sm text-muted-foreground">AI Tools Indexed</p>
                </CardContent>
              </Card>
              <Card className="border-dashed">
                <CardContent className="pt-6 text-center">
                  <div className="text-3xl font-bold text-primary mb-2">Real-time</div>
                  <p className="text-sm text-muted-foreground">Search Results</p>
                </CardContent>
              </Card>
              <Card className="border-dashed">
                <CardContent className="pt-6 text-center">
                  <div className="text-3xl font-bold text-primary mb-2">AI-Powered</div>
                  <p className="text-sm text-muted-foreground">Matching & Summaries</p>
                </CardContent>
              </Card>
            </div>
          </motion.div>
        )}

        {/* No Results State */}
        {!loading && !error && results.length === 0 && query && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <div className="max-w-md mx-auto">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                <Search className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-semibold mb-2">No results found</h3>
              <p className="text-muted-foreground mb-6">
                Try adjusting your search query or browse categories above
              </p>
              <Button
                variant="outline"
                onClick={() => setQuery('')}
              >
                Clear Search
              </Button>
            </div>
          </motion.div>
        )}
      </div>

      {/* Preview Drawer */}
      <DiscoveryPreviewDrawer
        result={selectedResult}
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        searchQuery={query}
      />
    </div>
  );
}
