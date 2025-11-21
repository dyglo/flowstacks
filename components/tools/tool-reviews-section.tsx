'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ReviewWithProfile } from '@/lib/types';
import { upsertMyToolReview, getMyToolReview } from '@/lib/supabaseBrowserClient';
import { useUser } from '@/components/auth/user-provider';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Star } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface ToolReviewsSectionProps {
  toolSlug: string;
  reviews: ReviewWithProfile[];
  avgRating: number;
  reviewCount: number;
}

export function ToolReviewsSection({ 
  toolSlug, 
  reviews: initialReviews, 
  avgRating: initialAvgRating, 
  reviewCount: initialReviewCount 
}: ToolReviewsSectionProps) {
  const { user } = useUser();
  const { toast } = useToast();
  const router = useRouter();
  
  const [rating, setRating] = useState<number>(0);
  const [reviewText, setReviewText] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Check if user has already reviewed to pre-fill
  useEffect(() => {
    if (user) {
      getMyToolReview(toolSlug).then((review) => {
        if (review) {
          setRating(review.rating);
          setReviewText(review.review_text || '');
        }
      });
    }
  }, [user, toolSlug]);

  const handleSubmit = async () => {
    if (rating === 0) {
      toast({
        title: "Rating required",
        description: "Please select a star rating.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await upsertMyToolReview(toolSlug, rating, reviewText);
      toast({
        title: "Review submitted",
        description: "Your review has been posted successfully.",
      });
      router.refresh(); // Refresh server data
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit review. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1">
            <Star className="w-6 h-6 fill-yellow-400 text-yellow-400" />
            <span className="text-2xl font-bold">{initialAvgRating.toFixed(1)}</span>
        </div>
        <span className="text-muted-foreground">
            {initialReviewCount} {initialReviewCount === 1 ? 'review' : 'reviews'}
        </span>
      </div>

      <div className="space-y-4">
        {initialReviews.length === 0 ? (
          <p className="text-muted-foreground">No reviews yet.</p>
        ) : (
          initialReviews.map((item) => (
            <Card key={item.review.id}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="flex gap-4 w-full">
                    <Avatar>
                      <AvatarImage src={item.profile?.avatar_url || undefined} />
                      <AvatarFallback>{item.profile?.display_name?.[0]?.toUpperCase() || 'A'}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold">{item.profile?.display_name || 'Anonymous'}</span>
                        {item.profile?.persona && (
                          <Badge variant="secondary" className="text-xs">
                            {item.profile.persona}
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-1 mt-1">
                         {Array.from({ length: 5 }).map((_, i) => (
                            <Star 
                                key={i} 
                                className={`w-4 h-4 ${i < item.review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} 
                            />
                         ))}
                         <span className="text-xs text-muted-foreground ml-2">
                            {item.review.created_at && formatDistanceToNow(new Date(item.review.created_at), { addSuffix: true })}
                         </span>
                      </div>
                      {item.review.review_text && (
                        <p className="mt-2 text-sm">{item.review.review_text}</p>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
      
      <div className="pt-8 border-t">
        <h3 className="text-lg font-semibold mb-4">
          {rating > 0 && user ? "Update your review" : "Write a Review"}
        </h3>
        {!user ? (
           <Button asChild>
             <Link href={`/auth/sign-in?redirect=/tools/${toolSlug}`}>
               Sign in to leave a review
             </Link>
           </Button>
        ) : (
           <div className="space-y-4 max-w-xl">
              <div className="flex gap-1">
                 {[1, 2, 3, 4, 5].map((star) => (
                    <button 
                        key={star} 
                        type="button"
                        onClick={() => setRating(star)}
                        className="focus:outline-none transition-transform hover:scale-110"
                    >
                        <Star 
                            className={`w-8 h-8 ${star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} 
                        />
                    </button>
                 ))}
              </div>
              <Textarea 
                placeholder="Share your experience with this tool..." 
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
              />
              <Button onClick={handleSubmit} disabled={isSubmitting}>
                {isSubmitting ? 'Submitting...' : 'Submit Review'}
              </Button>
           </div>
        )}
      </div>
    </div>
  );
}

