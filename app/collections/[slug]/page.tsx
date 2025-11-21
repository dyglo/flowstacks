import { notFound } from 'next/navigation';
import { ArrowLeft, Package } from 'lucide-react';
import Link from 'next/link';
import { getCollectionBySlug, getAllCollections, getToolsBySlugs } from '@/lib/data';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ToolCard } from '@/components/tools/tool-card';

export function generateStaticParams() {
  const collections = getAllCollections();
  return collections.map((collection) => ({
    slug: collection.slug,
  }));
}

export default async function CollectionDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const collection = getCollectionBySlug(slug);

  if (!collection) {
    notFound();
  }

  const tools = getToolsBySlugs(collection.toolSlugs);

  return (
    <div className="container max-w-6xl mx-auto px-4 py-8">
      <Button variant="ghost" asChild className="mb-6">
        <Link href="/collections">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Collections
        </Link>
      </Button>

      <div className="space-y-8">
        <div>
          <div className="flex items-start gap-4 mb-4">
            <div className="p-4 bg-primary/10 rounded-lg">
              <Package className="h-8 w-8 text-primary" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-4xl font-bold">{collection.name}</h1>
                <Badge variant="secondary" className="capitalize text-sm">
                  {collection.persona}
                </Badge>
              </div>
              <p className="text-lg text-muted-foreground mb-2">{collection.tagline}</p>
              <p className="text-muted-foreground">{collection.description}</p>
            </div>
          </div>

          <div className="bg-muted/50 rounded-lg p-6 mt-6">
            <h2 className="font-semibold mb-2">Why this stack works</h2>
            <p className="text-muted-foreground leading-relaxed">
              This collection brings together {tools.length} powerful tools that complement each other
              perfectly. Each tool has been carefully selected to address specific productivity needs
              while maintaining seamless integration across your workflow. Together, they provide a
              comprehensive solution for {collection.persona || 'professionals'} looking to maximize
              their efficiency.
            </p>
          </div>
        </div>

        <Separator />

        <div>
          <h2 className="text-2xl font-semibold mb-6">
            Tools in this collection ({tools.length})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tools.map((tool) => (
              <ToolCard key={tool.id} tool={tool} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
