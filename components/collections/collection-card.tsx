'use client';

import { motion } from 'framer-motion';
import { Package, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { Collection } from '@/lib/types';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface CollectionCardProps {
  collection: Collection;
  toolCount?: number;
}

export function CollectionCard({ collection, toolCount }: CollectionCardProps) {
  const count = toolCount ?? collection.toolSlugs.length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02, y: -4 }}
      transition={{ duration: 0.2 }}
    >
      <Card className="h-full hover:border-primary/50 transition-colors group">
        <CardHeader className="space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div className="p-3 bg-primary/10 w-fit rounded-lg group-hover:bg-primary/20 transition-colors">
              <Package className="h-6 w-6 text-primary" />
            </div>
            <Badge variant="secondary" className="capitalize">
              {collection.persona}
            </Badge>
          </div>

          <div>
            <CardTitle className="text-xl mb-2 group-hover:text-primary transition-colors">
              {collection.name}
            </CardTitle>
            <p className="text-sm text-muted-foreground mb-2">{collection.tagline}</p>
            <CardDescription className="leading-relaxed">
              {collection.description}
            </CardDescription>
          </div>

          <div className="flex items-center justify-between pt-4">
            <p className="text-sm text-muted-foreground">
              {count} {count === 1 ? 'tool' : 'tools'}
            </p>
            <Button variant="ghost" size="sm" asChild className="group-hover:text-primary">
              <Link href={`/collections/${collection.slug}`}>
                View Stack
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </CardHeader>
      </Card>
    </motion.div>
  );
}
