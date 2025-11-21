'use client';

import { useState, useEffect, useRef } from 'react';
import { Tool } from '@/lib/types';
import { getToolLogo, getToolLogoFallbacks, getToolInitial } from '@/lib/utils';

interface ToolLogoProps {
  tool: Tool;
  className?: string;
  size?: number;
  alt?: string;
}

/**
 * Smart tool logo component that tries multiple favicon sources
 * with automatic fallback to ensure logos always display
 */
export function ToolLogo({ tool, className = 'w-8 h-8 object-contain', size, alt }: ToolLogoProps) {
  const [currentSrcIndex, setCurrentSrcIndex] = useState(0);
  const [hasError, setHasError] = useState(false);
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Get primary logo URL
  const primaryLogo = getToolLogo(tool);
  
  // Get fallback URLs
  const fallbacks = getToolLogoFallbacks(tool);
  
  // Combine primary and fallbacks, removing duplicates
  const allSources = [primaryLogo, ...fallbacks.filter(f => f !== primaryLogo)];
  
  const currentSrc = allSources[currentSrcIndex] || '/icons/default-tool.svg';
  const displayAlt = alt || `${tool.name} logo`;

  const handleError = () => {
    // Clear any pending retry timeout
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
    }
    
    // Try next fallback source with a small delay
    if (currentSrcIndex < allSources.length - 1) {
      retryTimeoutRef.current = setTimeout(() => {
        setCurrentSrcIndex(prev => prev + 1);
      }, 200); // Slightly longer delay to allow network to recover
    } else {
      // All sources failed, show initial fallback
      setHasError(true);
    }
  };

  const handleLoad = () => {
    // Successfully loaded - reset error state
    setHasError(false);
  };

  // Reset when tool changes
  useEffect(() => {
    setCurrentSrcIndex(0);
    setHasError(false);
    
    // Clear timeout on unmount
    return () => {
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
    };
  }, [tool.slug]);

  return (
    <div className="relative w-full h-full flex items-center justify-center">
      {!hasError ? (
        <img
          src={currentSrc}
          alt={displayAlt}
          className={className}
          style={size ? { width: size, height: size } : undefined}
          onError={handleError}
          onLoad={handleLoad}
          loading="lazy"
          decoding="async"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center text-lg font-semibold text-muted-foreground">
          {getToolInitial(tool.name)}
        </div>
      )}
    </div>
  );
}

