'use client';

import { motion } from 'framer-motion';
import { Code, Lightbulb, Rocket, GraduationCap } from 'lucide-react';
import Link from 'next/link';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const personas = [
  {
    icon: Rocket,
    title: 'Founders',
    description: 'Tools to help you build and scale your startup faster',
    href: '/collections/founder-starter-stack',
  },
  {
    icon: Code,
    title: 'Developers',
    description: 'Boost your coding productivity with AI-powered tools',
    href: '/collections/developer-productivity-stack',
  },
  {
    icon: GraduationCap,
    title: 'Students',
    description: 'Study smarter with AI tools for learning and research',
    href: '/collections/student-study-stack',
  },
  {
    icon: Lightbulb,
    title: 'Creators',
    description: 'Create amazing content faster with AI assistance',
    href: '/collections/creator-content-stack',
  },
];

export function PersonaCards() {
  return (
    <section className="py-16 md:py-24 bg-muted/50">
      <div className="container max-w-6xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Browse by persona</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Discover curated tool collections tailored to your role and goals
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {personas.map((persona, index) => {
            const Icon = persona.icon;
            return (
              <motion.div
                key={persona.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Link href={persona.href}>
                  <Card className="h-full hover:border-primary/50 transition-all hover:scale-105 cursor-pointer group">
                    <CardHeader>
                      <div className="mb-3 p-3 bg-primary/10 w-fit rounded-lg group-hover:bg-primary/20 transition-colors">
                        <Icon className="h-6 w-6 text-primary" />
                      </div>
                      <CardTitle className="group-hover:text-primary transition-colors">
                        {persona.title}
                      </CardTitle>
                      <CardDescription className="leading-relaxed">
                        {persona.description}
                      </CardDescription>
                    </CardHeader>
                  </Card>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
