import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Get the logo URL for a tool with multiple fallback strategies
 * Priority: Local SVG > Favicon from website > Default placeholder
 */
export function getToolLogo(tool: { logoUrl?: string | null; slug: string; name: string; websiteUrl?: string }): string {
  // 1) Use logoUrl if defined and it's a local SVG file that exists
  if (tool.logoUrl && tool.logoUrl.startsWith('/icons/') && tool.logoUrl.endsWith('.svg')) {
    return tool.logoUrl;
  }
  
  // 2) Try to derive from websiteUrl using favicon service
  if (tool.websiteUrl) {
    try {
      const url = new URL(tool.websiteUrl);
      const hostname = url.hostname.replace(/^www\./, '');
      
      // Use our API route to proxy favicons (avoids CORS issues)
      return `/api/favicon?domain=${encodeURIComponent(hostname)}`;
    } catch (e) {
      console.warn('Invalid websiteUrl for tool', tool.slug, tool.websiteUrl, e);
    }
  }
  
  // 3) Fallback to default placeholder
  return '/icons/default-tool.svg';
}

/**
 * Get alternative favicon URLs for fallback (used in components with retry logic)
 * Returns multiple reliable favicon services to try in order
 */
export function getToolLogoFallbacks(tool: { websiteUrl?: string; slug: string }): string[] {
  const fallbacks: string[] = [];
  
  if (tool.websiteUrl) {
    try {
      const url = new URL(tool.websiteUrl);
      const hostname = url.hostname.replace(/^www\./, '');
      
      // Try multiple reliable favicon services in order of reliability
      // 1. Our API proxy (avoids CORS, most reliable)
      fallbacks.push(`/api/favicon?domain=${encodeURIComponent(hostname)}`);
      
      // 2. Google's favicon service (direct, no CORS issues)
      fallbacks.push(`https://www.google.com/s2/favicons?domain=${hostname}&sz=128`);
      
      // 3. Clearbit logo API (high quality logos, reliable)
      fallbacks.push(`https://logo.clearbit.com/${hostname}`);
      
      // 4. Try direct favicon path (works for many sites)
      fallbacks.push(`https://${hostname}/favicon.ico`);
      
      // 5. icon.horse (good fallback service)
      fallbacks.push(`https://icon.horse/icon/${hostname}`);
      
    } catch (e) {
      // Invalid URL, skip fallbacks
    }
  }
  
  // Final fallback: default placeholder
  fallbacks.push('/icons/default-tool.svg');
  
  return fallbacks;
}

export function getToolInitial(name: string): string {
  return name.charAt(0).toUpperCase();
}
