'use client';

import { motion } from 'framer-motion';
import { getAllCollections } from '@/lib/data';
import { CollectionCard } from '@/components/collections/collection-card';

export default function CollectionsPage() {
  const collections = getAllCollections();

  return (
    <div className="container max-w-6xl mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-12"
      >
        <h1 className="text-4xl font-bold mb-4">Tool Collections</h1>
        <p className="text-lg text-muted-foreground max-w-3xl">
          Discover curated stacks of AI tools that work great together. Each collection is
          tailored to specific personas and use cases to help you build your perfect productivity
          workflow.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {collections.map((collection, index) => (
          <motion.div
            key={collection.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <CollectionCard collection={collection} />
          </motion.div>
        ))}
      </div>
    </div>
  );
}
