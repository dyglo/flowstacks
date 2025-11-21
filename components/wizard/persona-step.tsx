import { motion } from 'framer-motion';
import { Briefcase, Code, GraduationCap, Palette, User } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Persona } from '@/lib/recommendations';

interface PersonaStepProps {
  selectedPersona: Persona | null;
  onSelect: (persona: Persona) => void;
}

const personas = [
  {
    value: 'founder' as Persona,
    label: 'Founder',
    icon: Briefcase,
    description: 'Building and scaling a startup',
  },
  {
    value: 'developer' as Persona,
    label: 'Developer',
    icon: Code,
    description: 'Writing code and building products',
  },
  {
    value: 'student' as Persona,
    label: 'Student',
    icon: GraduationCap,
    description: 'Learning and academic work',
  },
  {
    value: 'creator' as Persona,
    label: 'Creator',
    icon: Palette,
    description: 'Content creation and storytelling',
  },
  {
    value: 'other' as Persona,
    label: 'Other',
    icon: User,
    description: 'General productivity user',
  },
];

export function PersonaStep({ selectedPersona, onSelect }: PersonaStepProps) {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold mb-3">Who are you?</h2>
        <p className="text-muted-foreground text-lg">
          Tell us about yourself so we can recommend the best tools
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto">
        {personas.map((persona, index) => {
          const Icon = persona.icon;
          const isSelected = selectedPersona === persona.value;

          return (
            <motion.div
              key={persona.value}
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
                onClick={() => onSelect(persona.value)}
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
                    {persona.label}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {persona.description}
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
