'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Tool, Collection } from '@/lib/types';
import { ToolCard } from '@/components/tools/tool-card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { createStack, addToolToStack, getMyStacks } from '@/lib/supabaseBrowserClient';
import Link from 'next/link';
import { ArrowRight, Save, Check } from 'lucide-react';

interface StackAdvisorProps {
  userId: string;
  persona: string;
  collection: Collection;
  tools: Tool[];
}

export function StackAdvisor({ userId, persona, collection, tools }: StackAdvisorProps) {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [savedStackId, setSavedStackId] = useState<string | null>(null);

  const handleSaveStack = async () => {
    setIsSaving(true);
    try {
      // 1. Check if stack exists
      const myStacks = await getMyStacks();
      
      // Name convention: "<Persona> Starter Stack"
      const targetName = `${persona.charAt(0).toUpperCase() + persona.slice(1)} Starter Stack`;
      
      // Check for existing stack with target name or the collection name
      let existingStack = myStacks.find(s => s.name === targetName || s.name === collection.name);
      let stackId = existingStack?.id;

      if (!stackId) {
        // Create stack if it doesn't exist
        const newStack = await createStack({
          name: targetName,
          persona: persona,
          visibility: 'private',
          is_default: false,
        });
        stackId = newStack.id;
      }

      // 2. Add tools
      // We use Promise.allSettled to avoid failing the whole batch if one fails (e.g. duplicates)
      const results = await Promise.allSettled(
        tools.map(tool => addToolToStack(stackId!, tool.slug))
      );

      // Check results if needed, but generally we assume success if stack exists
      const failed = results.filter(r => r.status === 'rejected');
      if (failed.length > 0) {
         console.warn('Some tools could not be added:', failed);
         // We don't block success for duplicates
      }

      setSavedStackId(stackId);
      toast.success('Stack saved successfully to your profile!');
      
      // Redirect to My Stacks page after a short delay
      setTimeout(() => {
        router.push('/stack');
      }, 1000);
      
    } catch (error: any) {
      console.error('Error saving stack:', error);
      toast.error('Failed to save stack. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-10 pb-12">
      {/* Persona Banner */}
      <div className="bg-primary/5 border border-primary/10 rounded-xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold">You&apos;re set up as a {persona.charAt(0).toUpperCase() + persona.slice(1)}</h2>
          <p className="text-muted-foreground text-sm mt-1">
            Based on your profile, we&apos;ve curated this stack for you.
          </p>
        </div>
        <Button variant="outline" asChild size="sm">
          <Link href="/settings/profile">
            Edit persona
          </Link>
        </Button>
      </div>

      {/* Main Recommended Stack */}
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
                <h1 className="text-3xl font-bold">{collection.name}</h1>
                <p className="text-lg text-muted-foreground mt-2 max-w-2xl">{collection.tagline || collection.description}</p>
            </div>
            {savedStackId ? (
                <Button asChild size="lg" className="gap-2 min-w-[180px]">
                    <Link href="/stack">
                        <Check className="w-4 h-4" />
                        View My Stacks
                    </Link>
                </Button>
            ) : (
                <Button size="lg" onClick={handleSaveStack} disabled={isSaving} className="gap-2 min-w-[180px]">
                    <Save className="w-4 h-4" />
                    {isSaving ? 'Saving...' : 'Save as My Stack'}
                </Button>
            )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {tools.map(tool => (
                <ToolCard key={tool.id} tool={tool} />
            ))}
        </div>
      </div>
    </div>
  );
}

