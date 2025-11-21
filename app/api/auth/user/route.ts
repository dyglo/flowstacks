import { NextRequest, NextResponse } from 'next/server';
import { createBrowserClient } from '@/lib/supabaseBrowserClient';

export async function GET(request: NextRequest) {
  try {
    // This is a workaround - in production, use middleware to sync cookies
    // For now, we'll use the browser client approach
    const supabase = createBrowserClient();
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
      return NextResponse.json({ user: null });
    }

    // Fetch profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('display_name, avatar_url, persona')
      .eq('id', user.id)
      .single();

    return NextResponse.json({
      user: {
        id: user.id,
        displayName: profile?.display_name ?? user.email?.split('@')[0] ?? null,
        avatarUrl: profile?.avatar_url ?? null,
        persona: profile?.persona ?? null,
      },
    });
  } catch (error) {
    return NextResponse.json({ user: null }, { status: 500 });
  }
}

