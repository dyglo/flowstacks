'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { createBrowserClient } from '@/lib/supabaseBrowserClient';
import { useRouter } from 'next/navigation';

interface CurrentUser {
  id: string;
  displayName?: string | null;
  avatarUrl?: string | null;
  persona?: string | null;
}

interface UserContextType {
  user: CurrentUser | null;
  loading: boolean;
  refresh: () => Promise<void>;
}

const UserContext = createContext<UserContextType>({
  user: null,
  loading: true,
  refresh: async () => {},
});

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const fetchUser = async () => {
    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

      // Skip if Supabase is not configured
      if (!supabaseUrl || !supabaseAnonKey) {
        setUser(null);
        setLoading(false);
        return;
      }

      const supabase = createBrowserClient();
      const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();

      if (authError || !authUser) {
        setUser(null);
        setLoading(false);
        return;
      }

      // Fetch profile with better error handling
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('display_name, avatar_url, persona')
        .eq('id', authUser.id)
        .maybeSingle();

      // Handle profile fetch errors gracefully
      if (profileError && profileError.code !== 'PGRST116') {
        console.error('Error fetching profile:', profileError);
        // Still set user with basic info even if profile fetch fails
        setUser({
          id: authUser.id,
          displayName: authUser.email?.split('@')[0] ?? null,
          avatarUrl: null,
          persona: null,
        });
        setLoading(false);
        return;
      }

      setUser({
        id: authUser.id,
        displayName: profile?.display_name ?? authUser.email?.split('@')[0] ?? null,
        avatarUrl: profile?.avatar_url ?? null,
        persona: profile?.persona ?? null,
      });
    } catch (error) {
      console.error('Error in fetchUser:', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();

    // Listen for auth changes (only if Supabase is configured)
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (supabaseUrl && supabaseAnonKey) {
      const supabase = createBrowserClient();
      const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
        // Only refresh if session actually changed
        if (event === 'SIGNED_IN' || event === 'SIGNED_OUT' || event === 'TOKEN_REFRESHED') {
          fetchUser();
          router.refresh();
        }
      });

      return () => {
        subscription.unsubscribe();
      };
    }
  }, [router]);

  return (
    <UserContext.Provider value={{ user, loading, refresh: fetchUser }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
}

