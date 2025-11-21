'use client';

import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  PenTool,
  Video,
  Calendar,
  Zap,
  Search,
  Code,
  ArrowRight
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getAllTools } from '@/lib/data';

interface CategoryConfig {
  id: string;
  label: string;
  icon: React.ReactNode;
  color: string;
  description: string;
  group: string;
}

const categories: CategoryConfig[] = [
  {
    id: 'AI Productivity',
    label: 'Productivity',
    icon: <Zap className="w-5 h-5" />,
    color: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
    description: 'AI tools for productivity and workflow',
    group: 'AI Productivity',
  },
  {
    id: 'AI Coding & Developer Tools',
    label: 'Developer Tools',
    icon: <Code className="w-5 h-5" />,
    color: 'bg-green-500/10 text-green-500 border-green-500/20',
    description: 'AI coding assistants and dev tools',
    group: 'AI Coding & Developer Tools',
  },
  {
    id: 'AI Design Tools',
    label: 'Design Tools',
    icon: <PenTool className="w-5 h-5" />,
    color: 'bg-pink-500/10 text-pink-500 border-pink-500/20',
    description: 'AI image, video, and design tools',
    group: 'AI Design Tools',
  },
  {
    id: 'AI Content Creation',
    label: 'Content Creation',
    icon: <Video className="w-5 h-5" />,
    color: 'bg-orange-500/10 text-orange-500 border-orange-500/20',
    description: 'AI writing and content tools',
    group: 'AI Content Creation',
  },
];

export function CategoryExplorer() {
  const router = useRouter();
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleCategoryClick = (group: string) => {
    router.push(`/tools?group=${encodeURIComponent(group)}`);
  };

  const handleToolClick = (slug: string, e: React.MouseEvent) => {
    e.stopPropagation();
    router.push(`/tools/${slug}`);
  };

  const getSampleTools = (group: string) => {
    const allTools = getAllTools();
    return allTools.filter(tool => tool.group === group).slice(0, 3);
  };

  const handleMouseEnter = (group: string) => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    hoverTimeoutRef.current = setTimeout(() => {
      setHoveredCategory(group);
    }, 200);
  };

  const handleMouseLeave = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    setHoveredCategory(null);
  };

  return (
    <section className="py-16 px-4">
      <div className="container max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-10"
        >
          <h2 className="text-3xl font-bold mb-3">Explore by Category</h2>
          <p className="text-muted-foreground">
            Find the perfect AI tools for your workflow
          </p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 relative">
          {categories.map((category, index) => {
            const isHovered = hoveredCategory === category.group;
            const sampleTools = getSampleTools(category.group);

            return (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{
                  duration: 0.4,
                  delay: index * 0.08,
                  type: 'spring',
                  stiffness: 200,
                  damping: 20,
                }}
                className="relative"
                onMouseEnter={() => handleMouseEnter(category.group)}
                onMouseLeave={handleMouseLeave}
              >
                <motion.div
                  whileHover={{ scale: 1.02, y: -4 }}
                  transition={{ duration: 0.2 }}
                >
                  <Card
                    className="h-full hover:border-primary/50 transition-colors cursor-pointer group"
                    onClick={() => handleCategoryClick(category.group)}
                  >
                    <CardHeader className="space-y-3">
                      <div className="flex items-center gap-3">
                        <Badge variant="outline" className={`${category.color} p-2`}>
                          {category.icon}
                        </Badge>
                        <CardTitle className="text-lg group-hover:text-primary transition-colors">
                          {category.label}
                        </CardTitle>
                      </div>
                      <CardDescription className="text-sm">
                        {category.description}
                      </CardDescription>
                      <div className="flex items-center text-sm text-muted-foreground group-hover:text-primary transition-colors">
                        <span>Explore</span>
                        <ArrowRight className="ml-1 h-3 w-3 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </CardHeader>
                  </Card>
                </motion.div>

                {isHovered && sampleTools.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    transition={{ duration: 0.2 }}
                    className="absolute top-full left-0 right-0 mt-2 z-20"
                    onMouseEnter={() => {
                      if (hoverTimeoutRef.current) {
                        clearTimeout(hoverTimeoutRef.current);
                      }
                      setHoveredCategory(category.id);
                    }}
                    onMouseLeave={handleMouseLeave}
                  >
                    <Card className="p-3 shadow-xl border-primary/30 bg-card/98 backdrop-blur-sm">
                      <p className="text-xs text-muted-foreground mb-2 font-medium">
                        Popular Tools:
                      </p>
                      <div className="space-y-2">
                        {sampleTools.map((tool, i) => (
                          <motion.div
                            key={tool.id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.05 }}
                          >
                            <Link
                              href={`/tools/${tool.slug}`}
                              onClick={(e) => handleToolClick(tool.slug, e)}
                              className="block text-xs px-3 py-2 bg-muted/50 hover:bg-muted rounded-md text-foreground/90 font-medium transition-colors hover:text-primary cursor-pointer"
                            >
                              {tool.name}
                            </Link>
                          </motion.div>
                        ))}
                      </div>
                      <Link
                        href={`/tools?group=${encodeURIComponent(category.group)}`}
                        className="block mt-3 pt-2 border-t text-xs text-center text-muted-foreground hover:text-primary transition-colors font-medium"
                      >
                        View all {category.label.toLowerCase()} →
                      </Link>
                    </Card>
                  </motion.div>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
