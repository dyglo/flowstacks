import { createServerClient } from './supabaseServerClient';

export interface CurrentUser {
  id: string;
  displayName?: string | null;
  avatarUrl?: string | null;
  persona?: string | null;
}

/**
 * Get the current authenticated user from the server
 * Note: This requires cookies to be set by the browser client or middleware
 */
export async function getCurrentUser(): Promise<CurrentUser | null> {
  try {
    const supabase = createServerClient();
    if (!supabase) {
      return null;
    }
    
    // Try to get user from session
    // Note: This may not work without middleware syncing cookies
    // For now, return null and let client-side handle auth display
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return null;
    }

    // Fetch the profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('display_name, avatar_url, persona')
      .eq('id', user.id)
      .single();

    if (profileError && profileError.code !== 'PGRST116') {
      console.error('Error fetching profile:', profileError);
    }

    return {
      id: user.id,
      displayName: profile?.display_name ?? user.email?.split('@')[0] ?? null,
      avatarUrl: profile?.avatar_url ?? null,
      persona: profile?.persona ?? null,
    };
  } catch (error) {
    // Silently fail - client-side will handle auth display
    return null;
  }
}

