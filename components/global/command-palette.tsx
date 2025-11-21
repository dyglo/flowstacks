'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command';
import { Badge } from '@/components/ui/badge';
import { buildSearchIndex, searchIndex, SearchResult } from '@/lib/search-index';
import {
  Package,
  Layers,
  Zap,
  Users,
  Sparkles,
} from 'lucide-react';

const typeIcons = {
  tool: Package,
  category: Layers,
  collection: Sparkles,
  action: Zap,
  persona: Users,
};

const typeLabels = {
  tool: 'Tools',
  category: 'Categories',
  collection: 'Collections',
  action: 'Quick Actions',
  persona: 'Personas',
};

export function CommandPalette() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [mounted, setMounted] = useState(false);

  const index = useMemo(() => buildSearchIndex(), []);
  const results = useMemo(() => searchIndex(search, index), [search, index]);

  const groupedResults = useMemo(() => {
    const groups: Record<string, SearchResult[]> = {};
    results.forEach((result) => {
      if (!groups[result.type]) {
        groups[result.type] = [];
      }
      groups[result.type].push(result);
    });
    return groups;
  }, [results]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  const handleSelect = (url: string) => {
    setOpen(false);
    setSearch('');
    router.push(url);
  };

  if (!mounted) {
    return null;
  }

  return (
    <>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
        )}
      </AnimatePresence>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.15, type: 'spring', stiffness: 300, damping: 30 }}
        >
          <Command className="rounded-lg border shadow-2xl">
            <CommandInput
              placeholder="Search tools, collections, categories..."
              value={search}
              onValueChange={setSearch}
            />
            <CommandList>
              <CommandEmpty>No results found.</CommandEmpty>

              {Object.entries(groupedResults).map(([type, items], groupIndex) => (
                <motion.div
                  key={type}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: groupIndex * 0.05, duration: 0.2 }}
                >
                  <CommandGroup
                    heading={typeLabels[type as keyof typeof typeLabels]}
                  >
                    {items.map((item, index) => {
                      const Icon = typeIcons[item.type];
                      return (
                        <motion.div
                          key={item.id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{
                            delay: groupIndex * 0.05 + index * 0.02,
                            duration: 0.15,
                          }}
                        >
                          <CommandItem
                            value={item.title}
                            onSelect={() => handleSelect(item.url)}
                            className="flex items-center gap-3 cursor-pointer"
                          >
                            <div className="flex items-center justify-center w-8 h-8 rounded-md bg-muted">
                              {item.icon ? (
                                <img
                                  src={item.icon}
                                  alt={item.title}
                                  className="w-5 h-5 object-cover rounded"
                                />
                              ) : (
                                <Icon className="w-4 h-4" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="font-medium truncate">
                                  {item.title}
                                </span>
                                {item.badge && (
                                  <Badge variant="secondary" className="text-xs">
                                    {item.badge}
                                  </Badge>
                                )}
                              </div>
                              {item.subtitle && (
                                <p className="text-xs text-muted-foreground truncate">
                                  {item.subtitle}
                                </p>
                              )}
                            </div>
                          </CommandItem>
                        </motion.div>
                      );
                    })}
                  </CommandGroup>
                  {groupIndex < Object.keys(groupedResults).length - 1 && (
                    <CommandSeparator />
                  )}
                </motion.div>
              ))}
            </CommandList>
          </Command>
        </motion.div>
      </CommandDialog>
    </>
  );
}
