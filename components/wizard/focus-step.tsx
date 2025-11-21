import { motion } from 'framer-motion';
import { Pencil, Video, Calendar, Zap, Search, Code, Layers } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

import { Badge } from '@/components/ui/badge';

interface FocusStepProps {
  selectedFocusAreas: string[];
  onToggle: (category: string) => void;
}

const focusOptions = [
  {
    value: 'writing',
    label: 'Writing',
    icon: Pencil,
    description: 'Content, docs, and text editing',
  },
  {
    value: 'meeting',
    label: 'Meetings',
    icon: Video,
    description: 'Video calls and collaboration',
  },
  {
    value: 'planning',
    label: 'Planning',
    icon: Calendar,
    description: 'Task management and scheduling',
  },
  {
    value: 'automation',
    label: 'Automation',
    icon: Zap,
    description: 'Workflows and integrations',
  },
  {
    value: 'research',
    label: 'Research',
    icon: Search,
    description: 'Learning and knowledge work',
  },
  {
    value: 'devtools',
    label: 'DevTools',
    icon: Code,
    description: 'Development and coding tools',
  },
  {
    value: 'other',
    label: 'Other',
    icon: Layers,
    description: 'General productivity tools',
  },
];

export function FocusStep({ selectedFocusAreas, onToggle }: FocusStepProps) {
  const canSelectMore = selectedFocusAreas.length < 3;

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold mb-3">What do you focus on?</h2>
        <p className="text-muted-foreground text-lg mb-2">
          Select 1–3 areas where you need the most help
        </p>
        <Badge variant="secondary" className="text-sm">
          {selectedFocusAreas.length} of 3 selected
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto">
        {focusOptions.map((option, index) => {
          const Icon = option.icon;
          const isSelected = selectedFocusAreas.includes(option.value);
          const isDisabled = !isSelected && !canSelectMore;

          return (
            <motion.div
              key={option.value}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <Card
                className={`cursor-pointer transition-all ${
                  isDisabled
                    ? 'opacity-50 cursor-not-allowed'
                    : 'hover:shadow-lg'
                } ${
                  isSelected
                    ? 'border-primary border-2 bg-primary/5'
                    : 'hover:border-primary/50'
                }`}
                onClick={() => !isDisabled && onToggle(option.value)}
              >
                <CardContent className="p-6 text-center relative">
                  {isSelected && (
                    <div className="absolute top-3 right-3">
                      <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                        <span className="text-primary-foreground text-xs font-bold">
                          ✓
                        </span>
                      </div>
                    </div>
                  )}
                  <div
                    className={`inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 ${
                      isSelected
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted'
                    }`}
                  >
                    <Icon className="h-8 w-8" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">
                    {option.label}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {option.description}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
