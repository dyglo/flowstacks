import { motion } from 'framer-motion';
import { ExternalLink, Copy, CheckCheck, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tool } from '@/lib/types';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { generateStackMarkdown } from '@/lib/recommendations';

interface SummaryStepProps {
  recommendedTools: Tool[];
  persona: string;
  focusAreas: string[];
}

export function SummaryStep({
  recommendedTools,
  persona,
  focusAreas,
}: SummaryStepProps) {
  const [copied, setCopied] = useState(false);
  const router = useRouter();

  const handleCopyMarkdown = async () => {
    const markdown = generateStackMarkdown(recommendedTools);
    await navigator.clipboard.writeText(markdown);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleViewInTools = () => {
    const params = new URLSearchParams({
      persona,
      focus: focusAreas.join(','),
    });
    router.push(`/tools?${params.toString()}`);
  };

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold mb-3">Your Personalized Stack</h2>
        <p className="text-muted-foreground text-lg mb-4">
          Based on your preferences, we recommend these tools
        </p>
        <div className="flex items-center justify-center gap-2 flex-wrap">
          <Badge variant="secondary" className="capitalize">
            {persona}
          </Badge>
          {focusAreas.map((area) => (
            <Badge key={area} variant="outline" className="capitalize">
              {area}
            </Badge>
          ))}
        </div>
      </div>

      {recommendedTools.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">
            No tools found matching your criteria. Try adjusting your preferences.
          </p>
          <Button onClick={() => router.push('/tools')}>
            Browse All Tools
          </Button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-6xl mx-auto">
            {recommendedTools.map((tool, index) => (
              <motion.a
                key={tool.id}
                href={`/tools/${tool.slug}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="group"
              >
                <Card className="h-full hover:border-primary/50 transition-all hover:shadow-lg">
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg mb-1 group-hover:text-primary transition-colors">
                          {tool.name}
                        </h3>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {tool.tagline}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 mb-3">
                      <Badge variant="secondary" className="text-xs capitalize">
                        {tool.category}
                      </Badge>
                      <Badge
                        variant={
                          tool.pricing === 'free'
                            ? 'default'
                            : tool.pricing === 'freemium'
                            ? 'secondary'
                            : 'outline'
                        }
                        className="text-xs capitalize"
                      >
                        {tool.pricing}
                      </Badge>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <ExternalLink className="h-3 w-3" />
                        View details
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </motion.a>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.4 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4"
          >
            <Button size="lg" onClick={handleViewInTools}>
              View in Tools Page
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={handleCopyMarkdown}
              disabled={copied}
            >
              {copied ? (
                <>
                  <CheckCheck className="mr-2 h-4 w-4" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="mr-2 h-4 w-4" />
                  Copy as Markdown
                </>
              )}
            </Button>
          </motion.div>
        </>
      )}
    </div>
  );
}
