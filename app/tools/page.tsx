'use client';

import { Suspense, useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Search } from 'lucide-react';
import { getAllTools, searchTools, getToolBySlug, getToolsByCategory, getToolsByGroup } from '@/lib/data';
import { PricingModel, Tool } from '@/lib/types';
import { Input } from '@/components/ui/input';
import { ToolGrid } from '@/components/tools/tool-grid';
import { ToolFilters } from '@/components/tools/tool-filters';
import { ToolDetail } from '@/components/tools/tool-detail';
import { SmartChips } from '@/components/tools/smart-chips';
import { getSmartFilters, SmartFilter } from '@/lib/smart-filters';

function ToolsPageContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q') || '';

  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedGroups, setSelectedGroups] = useState<string[]>([]);
  const [selectedPricing, setSelectedPricing] = useState<PricingModel[]>([]);
  const [selectedTool, setSelectedTool] = useState<Tool | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const allTools = useMemo(() => getAllTools(), []);

  const smartFilters = useMemo(() => {
    return getSmartFilters(searchQuery, allTools);
  }, [searchQuery, allTools]);

  const filteredTools = useMemo(() => {
    let tools = allTools;

    if (searchQuery.trim()) {
      tools = searchTools(searchQuery, tools);
    }

    if (selectedCategories.length > 0) {
      tools = tools.filter(tool => selectedCategories.includes(tool.category));
    }

    if (selectedGroups.length > 0) {
      tools = tools.filter(tool => selectedGroups.includes(tool.group));
    }

    if (selectedPricing.length > 0) {
      tools = tools.filter(tool => selectedPricing.includes(tool.pricing));
    }

    return tools;
  }, [allTools, searchQuery, selectedCategories, selectedGroups, selectedPricing]);

  const relatedTools = useMemo(() => {
    if (!selectedTool) return [];
    return getToolsByCategory(selectedTool.category)
      .filter(tool => tool.id !== selectedTool.id)
      .slice(0, 3);
  }, [selectedTool]);

  const handleCategoryToggle = (category: string) => {
    setSelectedCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const handlePricingToggle = (pricing: PricingModel) => {
    setSelectedPricing(prev =>
      prev.includes(pricing)
        ? prev.filter(p => p !== pricing)
        : [...prev, pricing]
    );
  };

  const handleViewDetails = (slug: string) => {
    const tool = getToolBySlug(slug);
    if (tool) {
      setSelectedTool(tool);
      setIsDetailOpen(true);
    }
  };

  const handleSmartFilterClick = (filter: SmartFilter) => {
    if (filter.type === 'category') {
      handleCategoryToggle(filter.value);
    } else if (filter.type === 'pricing') {
      handlePricingToggle(filter.value as PricingModel);
    } else if (filter.type === 'tag') {
      setSearchQuery(filter.value);
    }
  };

  useEffect(() => {
    const group = searchParams.get('group');
    const category = searchParams.get('category');
    if (group) {
      setSelectedGroups([decodeURIComponent(group)]);
    }
    if (category) {
      setSelectedCategories([category]);
    }
  }, [searchParams]);

  return (
    <>
      <div className="container max-w-6xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold mb-4">Explore AI Tools</h1>
          <p className="text-lg text-muted-foreground mb-6">
            Browse our curated collection of {allTools.length} AI productivity tools
          </p>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search tools, categories, or features..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-12 text-base"
            />
          </div>
        </motion.div>

        <SmartChips filters={smartFilters} onFilterClick={handleSmartFilterClick} />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-8"
        >
          <ToolFilters
            selectedCategories={selectedCategories}
            selectedPricing={selectedPricing}
            onCategoryToggle={handleCategoryToggle}
            onPricingToggle={handlePricingToggle}
          />
        </motion.div>

        <div className="mb-4">
          <p className="text-sm text-muted-foreground">
            Showing {filteredTools.length} {filteredTools.length === 1 ? 'tool' : 'tools'}
          </p>
        </div>

        <ToolGrid tools={filteredTools} onViewDetails={handleViewDetails} />
      </div>

      <ToolDetail
        tool={selectedTool}
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        relatedTools={relatedTools}
        onViewDetails={handleViewDetails}
      />
    </>
  );
}

function ToolsPageFallback() {
  return (
    <div className="container max-w-6xl mx-auto px-4 py-8 space-y-6 animate-pulse">
      <div className="h-10 w-64 rounded bg-muted" />
      <div className="h-4 w-80 rounded bg-muted" />
      <div className="h-12 w-full rounded bg-muted" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-4">
        {[...Array(6)].map((_, index) => (
          <div key={index} className="h-48 rounded-lg bg-muted/70" />
        ))}
      </div>
    </div>
  );
}

export default function ToolsPage() {
  return (
    <Suspense fallback={<ToolsPageFallback />}>
      <ToolsPageContent />
    </Suspense>
  );
}
