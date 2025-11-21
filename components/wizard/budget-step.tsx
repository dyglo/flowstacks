import { motion } from 'framer-motion';
import { DollarSign, Gift, CreditCard } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { BudgetPreference } from '@/lib/recommendations';

interface BudgetStepProps {
  selectedBudget: BudgetPreference | null;
  onSelect: (budget: BudgetPreference) => void;
}

const budgetOptions = [
  {
    value: 'free' as BudgetPreference,
    label: 'Free Only',
    icon: Gift,
    description: 'Only show completely free tools',
    color: 'text-green-600 dark:text-green-400',
  },
  {
    value: 'freemium-ok' as BudgetPreference,
    label: 'Freemium OK',
    icon: DollarSign,
    description: 'Free or freemium tools with optional paid features',
    color: 'text-blue-600 dark:text-blue-400',
  },
  {
    value: 'paid-ok' as BudgetPreference,
    label: 'Paid OK',
    icon: CreditCard,
    description: 'Show all tools including paid subscriptions',
    color: 'text-amber-600 dark:text-amber-400',
  },
];

export function BudgetStep({ selectedBudget, onSelect }: BudgetStepProps) {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold mb-3">What's your budget?</h2>
        <p className="text-muted-foreground text-lg">
          Help us filter tools based on your budget preference
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto">
        {budgetOptions.map((option, index) => {
          const Icon = option.icon;
          const isSelected = selectedBudget === option.value;

          return (
            <motion.div
              key={option.value}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <Card
                className={`cursor-pointer transition-all hover:shadow-lg ${
                  isSelected
                    ? 'border-primary border-2 bg-primary/5'
                    : 'hover:border-primary/50'
                }`}
                onClick={() => onSelect(option.value)}
              >
                <CardContent className="p-6 text-center">
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
