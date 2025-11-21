'use client';

import { createClient } from '@supabase/supabase-js';
import { Database } from './database.types';

/**
 * Browser-side Supabase client for use in Client Components.
 * This client handles authentication and session management automatically.
 * Uses singleton pattern to prevent multiple GoTrueClient instances.
 */
let browserClient: ReturnType<typeof createClient<Database>> | null = null;

export function createBrowserClient() {
  // Return existing client if already created
  if (browserClient) {
    return browserClient;
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    // Return a mock client that won't work but won't crash the app
    // This allows the app to run without Supabase configured
    console.warn('Missing Supabase environment variables. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY');
    browserClient = createClient<Database>('https://placeholder.supabase.co', 'placeholder-key');
    return browserClient;
  }

  browserClient = createClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  });

  return browserClient;
}

/**
 * Get the current authenticated user
 */
export async function getCurrentUser() {
  const supabase = createBrowserClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  
  if (error) {
    throw new Error(`Failed to get user: ${error.message}`);
  }
  
  return user;
}

/**
 * Helper functions for common operations
 */

/**
 * Fetch all reviews for a specific tool
 */
export async function getToolReviews(toolSlug: string) {
  const supabase = createBrowserClient();
  
  const { data, error } = await supabase
    .from('tool_reviews')
    .select('*, profiles:user_id(display_name, avatar_url, persona)')
    .eq('tool_slug', toolSlug)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch reviews: ${error.message}`);
  }

  return data;
}

/**
 * Get the current user's review for a specific tool
 */
export async function getMyToolReview(toolSlug: string) {
  const supabase = createBrowserClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return null;
  }
  
  const { data, error } = await supabase
    .from('tool_reviews')
    .select('*')
    .eq('user_id', user.id)
    .eq('tool_slug', toolSlug)
    .single();

  if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
    throw new Error(`Failed to fetch review: ${error.message}`);
  }

  return data;
}

/**
 * Insert or update the current user's review for a tool
 */
export async function upsertMyToolReview(
  toolSlug: string,
  rating: number,
  reviewText: string | null
) {
  const supabase = createBrowserClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new Error("Not authenticated");
  }

  // Fetch persona from profiles to store on the review
  const { data: profile } = await supabase
    .from("profiles")
    .select("persona")
    .eq("id", user.id)
    .maybeSingle();

  const { error } = await supabase
    .from("tool_reviews")
    .upsert(
      {
        user_id: user.id,
        tool_slug: toolSlug,
        rating,
        review_text: reviewText,
        persona: profile?.persona ?? null,
      },
      { onConflict: "user_id,tool_slug" }
    );

  if (error) {
    console.error("Error upserting review", error);
    throw error;
  }
}

/**
 * Delete the current user's review for a tool
 */
export async function deleteMyToolReview(toolSlug: string) {
  const supabase = createBrowserClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('User must be authenticated to delete a review');
  }
  
  const { error } = await supabase
    .from('tool_reviews')
    .delete()
    .eq('user_id', user.id)
    .eq('tool_slug', toolSlug);

  if (error) {
    throw new Error(`Failed to delete review: ${error.message}`);
  }
}

/**
 * Get all stacks for the current user (including private ones)
 */
export async function getMyStacks() {
  const supabase = createBrowserClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return [];
  }
  
  const { data, error } = await supabase
    .from('user_stacks')
    .select('*, stack_items(*)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch stacks: ${error.message}`);
  }

  return data || [];
}

/**
 * Get a single stack with its items
 */
export async function getStackWithItems(stackId: string) {
  const supabase = createBrowserClient();
  
  const { data, error } = await supabase
    .from('user_stacks')
    .select('*, stack_items(*)')
    .eq('id', stackId)
    .single();

  if (error) {
    throw new Error(`Failed to fetch stack: ${error.message}`);
  }

  return data;
}

/**
 * Create a new stack for the current user
 */
export async function createStack(stack: {
  name: string;
  persona?: string;
  visibility?: 'private' | 'public';
  is_default?: boolean;
}) {
  const supabase = createBrowserClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('User must be authenticated to create a stack');
  }
  
  const { data, error } = await supabase
    .from('user_stacks')
    .insert({
      user_id: user.id,
      name: stack.name,
      persona: stack.persona || null,
      visibility: stack.visibility || 'private',
      is_default: stack.is_default || false,
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create stack: ${error.message}`);
  }

  return data;
}

/**
 * Update a stack
 */
export async function updateStack(
  stackId: string,
  updates: {
    name?: string;
    persona?: string;
    visibility?: 'private' | 'public';
    is_default?: boolean;
  }
) {
  const supabase = createBrowserClient();
  
  const { data, error } = await supabase
    .from('user_stacks')
    .update(updates)
    .eq('id', stackId)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update stack: ${error.message}`);
  }

  return data;
}

/**
 * Delete a stack
 */
export async function deleteStack(stackId: string) {
  const supabase = createBrowserClient();
  
  const { error } = await supabase
    .from('user_stacks')
    .delete()
    .eq('id', stackId);

  if (error) {
    throw new Error(`Failed to delete stack: ${error.message}`);
  }
}

/**
 * Add a tool to a stack
 */
export async function addToolToStack(stackId: string, toolSlug: string) {
  const supabase = createBrowserClient();
  
  const { data, error } = await supabase
    .from('stack_items')
    .insert({
      stack_id: stackId,
      tool_slug: toolSlug,
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to add tool to stack: ${error.message}`);
  }

  return data;
}

/**
 * Remove a tool from a stack
 */
export async function removeToolFromStack(stackId: string, toolSlug: string) {
  const supabase = createBrowserClient();
  
  const { error } = await supabase
    .from('stack_items')
    .delete()
    .eq('stack_id', stackId)
    .eq('tool_slug', toolSlug);

  if (error) {
    throw new Error(`Failed to remove tool from stack: ${error.message}`);
  }
}

/**
 * Get public stacks (for discovery)
 */
export async function getPublicStacks(limit = 10) {
  const supabase = createBrowserClient();
  
  const { data, error } = await supabase
    .from('user_stacks')
    .select('*, stack_items(*), profiles:user_id(display_name, avatar_url)')
    .eq('visibility', 'public')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    throw new Error(`Failed to fetch public stacks: ${error.message}`);
  }

  return data || [];
}

/**
 * Upload an avatar image to Supabase Storage
 * Returns the public URL of the uploaded image
 */
export async function uploadAvatar(file: File, userId: string): Promise<string | null> {
  const supabase = createBrowserClient();
  
  // Get file extension
  const fileExt = file.name.split('.').pop()?.toLowerCase() ?? 'png';
  
  // Create unique file path: {userId}-{timestamp}.{ext}
  const filePath = `${userId}-${Date.now()}.${fileExt}`;
  
  // Upload file with upsert enabled to replace existing avatars
  const { data: uploadData, error: uploadError } = await supabase.storage
    .from('avatars')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: true, // Allow overwriting existing files
    });

  if (uploadError) {
    console.error('Error uploading avatar:', uploadError.message || uploadError);
    return null;
  }

  // Get public URL
  const { data: publicUrlData } = supabase.storage
    .from('avatars')
    .getPublicUrl(filePath);

  if (!publicUrlData?.publicUrl) {
    console.error('Failed to get public URL for uploaded avatar');
    return null;
  }

  return publicUrlData.publicUrl;
}

