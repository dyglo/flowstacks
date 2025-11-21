'use client';

import {  PricingModel } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface ToolFiltersProps {
  selectedCategories: string[];
  selectedPricing: PricingModel[];
  onCategoryToggle: (category: string) => void;
  onPricingToggle: (pricing: PricingModel) => void;
}

const categories: { value: string; label: string }[] = [
  { value: 'writing', label: 'Writing' },
  { value: 'meeting', label: 'Meeting' },
  { value: 'automation', label: 'Automation' },
  { value: 'planning', label: 'Planning' },
  { value: 'research', label: 'Research' },
  { value: 'devtools', label: 'Dev Tools' },
  { value: 'other', label: 'Other' },
];

const pricingOptions: { value: PricingModel; label: string }[] = [
  { value: 'free', label: 'Free' },
  { value: 'freemium', label: 'Freemium' },
  { value: 'paid', label: 'Paid' },
];

export function ToolFilters({
  selectedCategories,
  selectedPricing,
  onCategoryToggle,
  onPricingToggle,
}: ToolFiltersProps) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-semibold mb-3">Category</h3>
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => {
            const isSelected = selectedCategories.includes(category.value);
            return (
              <Badge
                key={category.value}
                variant={isSelected ? 'default' : 'outline'}
                className={cn(
                  'cursor-pointer transition-all hover:scale-105',
                  isSelected && 'bg-primary text-primary-foreground'
                )}
                onClick={() => onCategoryToggle(category.value)}
              >
                {category.label}
              </Badge>
            );
          })}
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold mb-3">Pricing</h3>
        <div className="flex flex-wrap gap-2">
          {pricingOptions.map((pricing) => {
            const isSelected = selectedPricing.includes(pricing.value);
            return (
              <Badge
                key={pricing.value}
                variant={isSelected ? 'default' : 'outline'}
                className={cn(
                  'cursor-pointer transition-all hover:scale-105',
                  isSelected && 'bg-primary text-primary-foreground'
                )}
                onClick={() => onPricingToggle(pricing.value)}
              >
                {pricing.label}
              </Badge>
            );
          })}
        </div>
      </div>
    </div>
  );
}
