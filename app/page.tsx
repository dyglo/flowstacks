import { getFeaturedTools, getAllCollections } from '@/lib/data';
import { HeroSection } from '@/components/home/hero-section';
import { CategoryExplorer } from '@/components/home/category-explorer';
import { PersonaCards } from '@/components/home/persona-cards';
import { FeaturedCollections } from '@/components/home/featured-collections';
import { FeaturedTools } from '@/components/home/featured-tools';

export default function Home() {
  const featuredTools = getFeaturedTools().slice(0, 6);
  const collections = getAllCollections().slice(0, 3);

  return (
    <div>
      <HeroSection />
      <CategoryExplorer />
      <PersonaCards />
      <FeaturedCollections collections={collections} />
      <FeaturedTools tools={featuredTools} />
    </div>
  );
}
