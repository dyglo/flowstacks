'use client';

import { useRouter } from 'next/navigation';
import { RelatedToolsCarousel } from '@/components/tools/related-tools-carousel';
import { Tool } from '@/lib/types';

interface RelatedToolsCarouselWrapperProps {
  tools: Tool[];
}

export function RelatedToolsCarouselWrapper({ tools }: RelatedToolsCarouselWrapperProps) {
  const router = useRouter();

  const handleViewDetails = (slug: string) => {
    router.push(`/tools/${slug}`);
  };

  return <RelatedToolsCarousel tools={tools} onViewDetails={handleViewDetails} />;
}

