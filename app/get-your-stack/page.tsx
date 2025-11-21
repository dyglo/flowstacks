'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { createBrowserClient } from '@/lib/supabaseBrowserClient';
import { getDefaultCollectionSlugForPersona } from '@/lib/personaToCollection';
import { getCollectionBySlug, getToolsBySlugs } from '@/lib/data';
import { StackAdvisor } from './StackAdvisor';
import { PersonaPicker } from './PersonaPicker';
import { Button } from '@/components/ui/button';
import { ArrowRight, Loader2 } from 'lucide-react';

export default function GetYourStackPage() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [persona, setPersona] = useState<string | null>(null);

  const fetchUserAndProfile = async () => {
    setLoading(true);
    try {
      const supabase = createBrowserClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setUser(null);
        setLoading(false);
        return;
      }
      
      setUser(user);
      
      const { data: profile } = await supabase
        .from('profiles')
        .select('persona')
        .eq('id', user.id)
        .single();
        
      setPersona(profile?.persona || null);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserAndProfile();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // Logged out view
  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4 text-center -mt-16">
        <div className="max-w-2xl space-y-6">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
            Get your AI stack in 30 seconds
          </h1>
          <p className="text-xl text-muted-foreground">
            Sign in, tell us who you are, and we’ll recommend a curated AI stack for you.
          </p>
          <div className="pt-4">
             <Button asChild size="lg" className="gap-2">
                <Link href="/auth/sign-in?redirect=/get-your-stack">
                  Sign in to get your stack
                  <ArrowRight className="w-4 h-4" />
                </Link>
             </Button>
          </div>
        </div>
      </div>
    );
  }

  // Determine collection
  let collectionSlug = getDefaultCollectionSlugForPersona(persona);
  
  if (!collectionSlug || !persona || persona === 'other') {
    return <PersonaPicker onUpdate={fetchUserAndProfile} />;
  }

  const collection = getCollectionBySlug(collectionSlug);

  if (!collection) {
     // Fallback if collection not found but persona exists (shouldn't happen if data is consistent)
     return <PersonaPicker onUpdate={fetchUserAndProfile} />;
  }

  const tools = getToolsBySlugs(collection.toolSlugs);

  return (
    <div className="container max-w-7xl mx-auto py-8 px-4 md:px-8">
       <StackAdvisor 
          userId={user.id}
          persona={persona}
          collection={collection}
          tools={tools}
       />
    </div>
  );
}
