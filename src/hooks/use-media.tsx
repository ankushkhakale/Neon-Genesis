
import { useState, useEffect } from 'react';

/**
 * Custom hook for responsive media queries with better performance
 * @param query The media query to check
 * @returns Boolean indicating if the media query matches
 */
export function useMedia(query: string): boolean {
  const [matches, setMatches] = useState<boolean>(() => {
    // Initialize with a check if window is available (for SSR support)
    if (typeof window !== 'undefined') {
      return window.matchMedia(query).matches;
    }
    return false;
  });

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;
    
    const mediaQuery = window.matchMedia(query);
    
    // Set initial value
    setMatches(mediaQuery.matches);
    
    // Define event listener with debounce for performance
    let timeoutId: number;
    const handleChange = () => {
      clearTimeout(timeoutId);
      timeoutId = window.setTimeout(() => {
        setMatches(mediaQuery.matches);
      }, 50); // 50ms debounce
    };
    
    // Modern API
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
      return () => {
        clearTimeout(timeoutId);
        mediaQuery.removeEventListener('change', handleChange);
      };
    } 
    // Legacy API
    else {
      mediaQuery.addListener(handleChange);
      return () => {
        clearTimeout(timeoutId);
        mediaQuery.removeListener(handleChange);
      };
    }
  }, [query]);

  return matches;
}

/**
 * Optimized version of useIsMobile hook that uses useMedia
 * @returns Boolean indicating if the current viewport is mobile
 */
export function useIsMobile(breakpoint = 768): boolean {
  return useMedia(`(max-width: ${breakpoint - 1}px)`);
}

/**
 * Hook to determine if the page should use reduced motion
 * @returns Boolean indicating if reduced motion is preferred
 */
export function usePrefersReducedMotion(): boolean {
  return useMedia('(prefers-reduced-motion: reduce)');
}
