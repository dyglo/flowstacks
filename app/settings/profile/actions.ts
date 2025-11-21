'use server';

import { createServerClient } from '@/lib/supabaseServerClient';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function updateProfile(formData: {
  display_name: string;
  avatar_url?: string;
  persona?: string;
}) {
  const supabase = createServerClient();
  if (!supabase) {
    throw new Error('Supabase environment variables are not configured.');
  }
  
  // Check if user is authenticated
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  
  if (authError || !user) {
    redirect('/auth/sign-in');
  }

  // Update profile
  const { error } = await supabase
    .from('profiles')
    .update({
      display_name: formData.display_name,
      avatar_url: formData.avatar_url || null,
      persona: formData.persona || null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', user.id);

  if (error) {
    throw new Error(`Failed to update profile: ${error.message}`);
  }

  revalidatePath('/settings/profile');
}

