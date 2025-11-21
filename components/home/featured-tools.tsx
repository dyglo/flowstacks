'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Tool } from '@/lib/types';
import { ToolGrid } from '@/components/tools/tool-grid';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

interface FeaturedToolsProps {
  tools: Tool[];
}

export function FeaturedTools({ tools }: FeaturedToolsProps) {
  return (
    <section className="py-16 md:py-24">
      <div className="container max-w-6xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Editor&apos;s picks</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Hand-picked tools that stand out for their innovation and impact
          </p>
        </motion.div>

        <ToolGrid tools={tools} />

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-center mt-12"
        >
          <Button asChild size="lg">
            <Link href="/tools">
              Browse All Tools
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
