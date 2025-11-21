'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { createBrowserClient } from '@/lib/supabaseBrowserClient';

export function PersonaPicker({ onUpdate }: { onUpdate: () => void }) {
  const [loading, setLoading] = useState<string | null>(null);

  const handleSelect = async (value: string) => {
    setLoading(value);
    try {
        const supabase = createBrowserClient();
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
            toast.error("You must be logged in to set a persona");
            return;
        }

        const { error } = await supabase
            .from('profiles')
            .update({ persona: value })
            .eq('id', user.id);
            
        if (error) throw error;

        toast.success("Persona updated!");
        onUpdate(); // Refresh parent state
    } catch (e: any) {
        console.error(e);
        toast.error('Failed to update persona: ' + e.message);
        setLoading(null);
    }
  };

  const options = [
    { label: 'Founder', value: 'founder', desc: 'Building a startup' },
    { label: 'Developer', value: 'developer', desc: 'Writing code' },
    { label: 'Creator', value: 'creator', desc: 'Creating content' },
    { label: 'Student', value: 'student', desc: 'Learning & Research' },
  ];

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-4">
        <div className="max-w-4xl w-full space-y-8 text-center">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
              Pick a starting persona
            </h1>
            <p className="text-lg text-muted-foreground">
               We need to know a bit about you to recommend the right tools.
               You can change this later in your profile.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
             {options.map((p) => (
                <button 
                    key={p.value}
                    onClick={() => handleSelect(p.value)}
                    disabled={loading !== null}
                    className="w-full h-full p-6 rounded-xl border bg-card text-card-foreground hover:border-primary/50 hover:bg-accent/50 transition-all text-left flex flex-col gap-2 group relative disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <span className="text-xl font-semibold group-hover:text-primary">{p.label}</span>
                    <span className="text-sm text-muted-foreground">{p.desc}</span>
                    {loading === p.value && (
                        <div className="absolute inset-0 flex items-center justify-center bg-background/50 rounded-xl">
                            <Loader2 className="w-6 h-6 animate-spin text-primary" />
                        </div>
                    )}
                </button>
             ))}
          </div>
        </div>
      </div>
  );
}
