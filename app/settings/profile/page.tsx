'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { createBrowserClient, uploadAvatar } from '@/lib/supabaseBrowserClient';
import { toast } from 'sonner';

const profileFormSchema = z.object({
  display_name: z.string().min(1, 'Display name is required').max(50),
  avatar_url: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  persona: z.enum(['founder', 'developer', 'creator', 'student', 'other']).optional(),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

function getInitials(displayName: string): string {
  const parts = displayName.trim().split(' ');
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  return displayName[0].toUpperCase();
}

const personaLabels: Record<string, string> = {
  founder: 'Founder',
  developer: 'Developer',
  creator: 'Creator',
  student: 'Student',
  other: 'Other',
};

export default function ProfileSettingsPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      display_name: '',
      avatar_url: '',
      persona: undefined,
    },
  });

  useEffect(() => {
    let mounted = true;

    async function loadProfile() {
      try {
        const supabase = createBrowserClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
          if (mounted) {
            router.push('/auth/sign-in');
          }
          return;
        }

        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('display_name, avatar_url, persona')
          .eq('id', user.id)
          .maybeSingle();

        if (profileError) {
          console.error('Profile error:', profileError);
          if (mounted) {
            toast.error('Failed to load profile');
          }
          return;
        }

        // If profile doesn't exist, create it
        if (!profile) {
          const { error: insertError } = await supabase
            .from('profiles')
            .insert({
              id: user.id,
              display_name: user.email?.split('@')[0] || '',
              avatar_url: null,
              persona: null,
            });

          if (insertError) {
            console.error('Failed to create profile:', insertError);
            if (mounted) {
              toast.error(`Failed to create profile: ${insertError.message || insertError.code || 'Unknown error'}`);
            }
            return;
          }

          // Fetch the newly created profile
          const { data: newProfile, error: fetchError } = await supabase
            .from('profiles')
            .select('display_name, avatar_url, persona')
            .eq('id', user.id)
            .maybeSingle();

          if (fetchError) {
            console.error('Failed to fetch new profile:', fetchError);
          }

          if (mounted) {
            form.reset({
              display_name: newProfile?.display_name || '',
              avatar_url: newProfile?.avatar_url || '',
              persona: (newProfile?.persona as any) || undefined,
            });
          }
          return;
        }

        if (mounted) {
          form.reset({
            display_name: profile?.display_name || '',
            avatar_url: profile?.avatar_url || '',
            persona: (profile?.persona as any) || undefined,
          });
        }
      } catch (error) {
        console.error('Load profile error:', error);
        if (mounted) {
          toast.error('Failed to load profile');
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadProfile();

    return () => {
      mounted = false;
    };
  }, [router]);

  const watchedValues = form.watch();
  const displayName = watchedValues.display_name || '';
  const avatarUrl = watchedValues.avatar_url || '';
  const persona = watchedValues.persona;

  // Get the current avatar URL (prefer preview, then form value, then empty)
  const currentAvatarUrl = avatarPreview || avatarUrl || undefined;

  const handleAvatarFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file');
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size must be less than 5MB');
        return;
      }
      
      setSelectedFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async (data: ProfileFormValues) => {
    setIsSubmitting(true);
    try {
      const supabase = createBrowserClient();
      const { data: { user }, error: authError } = await supabase.auth.getUser();

      if (authError || !user) {
        toast.error('You must be signed in to update your profile');
        router.push('/auth/sign-in');
        setIsSubmitting(false);
        return;
      }

      let finalAvatarUrl: string | null = null;

      // Upload avatar file if selected (takes priority over URL)
      if (selectedFile) {
        const uploadedUrl = await uploadAvatar(selectedFile, user.id);
        if (uploadedUrl) {
          finalAvatarUrl = uploadedUrl;
          // Clear the selected file and preview
          setSelectedFile(null);
          setAvatarPreview(null);
        } else {
          toast.error('Failed to upload avatar image');
          setIsSubmitting(false);
          return;
        }
      } else if (data.avatar_url && data.avatar_url.trim() !== '') {
        // Use URL from form if no file was selected
        finalAvatarUrl = data.avatar_url.trim();
      }

      // Update profile directly using browser client
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          display_name: data.display_name,
          avatar_url: finalAvatarUrl || null,
          persona: data.persona || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (updateError) {
        console.error('Update error details:', {
          message: updateError.message,
          details: updateError.details,
          hint: updateError.hint,
          code: updateError.code,
        });
        throw new Error(`Failed to update profile: ${updateError.message || updateError.code || 'Unknown error'}`);
      }

      // Reload profile to get updated data
      const { data: updatedProfile, error: fetchError } = await supabase
        .from('profiles')
        .select('display_name, avatar_url, persona')
        .eq('id', user.id)
        .maybeSingle();

      if (fetchError) {
        console.error('Failed to fetch updated profile:', fetchError);
      }

      // Update form with fresh data
      if (updatedProfile) {
        form.reset({
          display_name: updatedProfile.display_name || '',
          avatar_url: updatedProfile.avatar_url || '',
          persona: (updatedProfile.persona as any) || undefined,
        });
      }
      
      toast.success('Profile updated successfully!');
      router.refresh();
    } catch (error: any) {
      console.error('Update profile error:', error);
      toast.error(error.message || 'Failed to update profile');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="container max-w-4xl mx-auto px-4 py-8">
        <div className="text-center py-12">
          <p className="text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Profile & Settings</h1>
        <p className="text-muted-foreground">
          Manage your FlowStacks profile and persona.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form Section */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>
                Update your display name, avatar, and persona.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="display_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Display name</FormLabel>
                        <FormControl>
                          <Input placeholder="John Doe" {...field} />
                        </FormControl>
                        <FormDescription>
                          This name will appear on your reviews and profile.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="avatar_url"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Avatar image</FormLabel>
                        <FormControl>
                          <div className="space-y-2">
                            <Input
                              type="file"
                              accept="image/*"
                              onChange={handleAvatarFileChange}
                              className="cursor-pointer"
                            />
                            <Input
                              placeholder="Or enter a URL: https://example.com/avatar.jpg"
                              {...field}
                            />
                          </div>
                        </FormControl>
                        <FormDescription>
                          Upload an image file (max 5MB) or enter an image URL.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="persona"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Persona</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select your persona" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="founder">Founder</SelectItem>
                            <SelectItem value="developer">Developer</SelectItem>
                            <SelectItem value="creator">Creator</SelectItem>
                            <SelectItem value="student">Student</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Your persona helps others understand your perspective.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? 'Saving...' : 'Save changes'}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>

        {/* Preview Section */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Preview</CardTitle>
              <CardDescription>
                How your profile will appear to others.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={currentAvatarUrl} alt={displayName} />
                  <AvatarFallback>
                    {displayName ? getInitials(displayName) : '?'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold truncate">
                    {displayName || 'Display name'}
                  </p>
                  {persona && (
                    <Badge variant="secondary" className="mt-1 text-xs">
                      {personaLabels[persona]}
                    </Badge>
                  )}
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <p className="text-sm font-medium">Review Preview</p>
                <div className="p-3 rounded-lg bg-muted/50 border space-y-2">
                  <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={currentAvatarUrl} alt={displayName} />
                      <AvatarFallback className="text-xs">
                        {displayName ? getInitials(displayName) : '?'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate">
                        {displayName || 'Display name'}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        {persona && (
                          <Badge variant="secondary" className="text-xs px-1.5 py-0">
                            {personaLabels[persona]}
                          </Badge>
                        )}
                        <span className="text-xs text-muted-foreground">
                          ⭐⭐⭐⭐⭐
                        </span>
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    This is how your review will look...
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

