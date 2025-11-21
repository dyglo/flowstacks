'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Layers, Trash2, Sparkles, ArrowRight, Plus } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ToolCard } from '@/components/tools/tool-card';
import { getMyStacks, deleteStack } from '@/lib/supabaseBrowserClient';
import { getToolsBySlugs } from '@/lib/data';
import { Tool } from '@/lib/types';
import { toast } from 'sonner';
import { createBrowserClient } from '@/lib/supabaseBrowserClient';

interface StackWithItems {
  id: string;
  name: string;
  persona: string | null;
  visibility: string;
  created_at: string | null;
  stack_items: Array<{
    id: number;
    tool_slug: string;
  }>;
}

export default function MyStacksPage() {
  const router = useRouter();
  const [stacks, setStacks] = useState<StackWithItems[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const supabase = createBrowserClient();
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          router.push('/auth/sign-in?redirect=/stack');
          return;
        }
        
        setUser(user);
        const myStacks = await getMyStacks();
        setStacks(myStacks as StackWithItems[]);
      } catch (error: any) {
        console.error('Error fetching stacks:', error);
        toast.error('Failed to load stacks');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [router]);

  const handleDeleteStack = async (stackId: string) => {
    if (!confirm('Are you sure you want to delete this stack?')) {
      return;
    }

    try {
      await deleteStack(stackId);
      setStacks(stacks.filter(s => s.id !== stackId));
      toast.success('Stack deleted successfully');
    } catch (error: any) {
      console.error('Error deleting stack:', error);
      toast.error('Failed to delete stack');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background py-8 px-4">
        <div className="container max-w-6xl mx-auto">
          <div className="space-y-4 animate-pulse">
            <div className="h-8 w-48 rounded bg-muted" />
            <div className="h-4 w-64 rounded bg-muted" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-8">
              {[...Array(3)].map((_, index) => (
                <div key={index} className="h-40 rounded-lg bg-muted/70" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const isEmpty = stacks.length === 0;

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="container max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
                <Layers className="h-8 w-8 text-primary" />
                My Stacks
              </h1>
              <p className="text-lg text-muted-foreground">
                {isEmpty
                  ? 'Manage your saved AI productivity stacks'
                  : `${stacks.length} ${stacks.length === 1 ? 'stack' : 'stacks'} saved`}
              </p>
            </div>
          </div>
        </motion.div>

        {isEmpty ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-center py-20"
          >
            <div className="max-w-md mx-auto space-y-6">
              <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-muted">
                <Layers className="h-12 w-12 text-muted-foreground" />
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-semibold">No stacks yet</h2>
                <p className="text-muted-foreground">
                  Start by getting personalized recommendations for your AI productivity stack
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link href="/get-your-stack">
                  <Button size="lg" className="gap-2">
                    <Sparkles className="h-4 w-4" />
                    Get Your Stack
                  </Button>
                </Link>
                <Link href="/tools">
                  <Button variant="outline" size="lg" className="gap-2">
                    Browse All Tools
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </motion.div>
        ) : (
          <div className="space-y-8">
            {stacks.map((stack, stackIndex) => {
              const toolSlugs = stack.stack_items.map(item => item.tool_slug);
              const tools = getToolsBySlugs(toolSlugs);

              return (
                <motion.div
                  key={stack.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: stackIndex * 0.1 }}
                  className="border rounded-xl p-6 bg-card"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h2 className="text-2xl font-semibold mb-1">{stack.name}</h2>
                      {stack.persona && (
                        <span className="text-sm text-muted-foreground">
                          {stack.persona.charAt(0).toUpperCase() + stack.persona.slice(1)} • {tools.length} {tools.length === 1 ? 'tool' : 'tools'}
                        </span>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteStack(stack.id)}
                      className="gap-2 text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete
                    </Button>
                  </div>
                  
                  {tools.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mt-4">
                      {tools.map((tool, toolIndex) => (
                        <ToolCard key={`${stack.id}-${tool.id}-${toolIndex}`} tool={tool} />
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-sm mt-4">No tools in this stack</p>
                  )}
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
