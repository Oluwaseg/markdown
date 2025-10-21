import { useEffect, useRef, useCallback } from 'react';

interface ScrollSyncOptions {
  enabled: boolean;
  threshold?: number;
}

export function useScrollSync(
  sourceRef: React.RefObject<HTMLElement | null>,
  targetRef: React.RefObject<HTMLElement | null>,
  options: ScrollSyncOptions = { enabled: true }
) {
  const isScrolling = useRef(false);
  const lastScrollTime = useRef(0);

  const syncScroll = useCallback((source: HTMLElement, target: HTMLElement) => {
    if (!options.enabled || isScrolling.current) return;

    const sourceRect = source.getBoundingClientRect();
    const targetRect = target.getBoundingClientRect();
    
    // Calculate scroll percentage
    const sourceScrollTop = source.scrollTop;
    const sourceScrollHeight = source.scrollHeight - source.clientHeight;
    const scrollPercentage = sourceScrollHeight > 0 ? sourceScrollTop / sourceScrollHeight : 0;
    
    // Apply to target
    const targetScrollHeight = target.scrollHeight - target.clientHeight;
    const targetScrollTop = scrollPercentage * targetScrollHeight;
    
    // Smooth scroll to synchronized position
    target.scrollTo({
      top: targetScrollTop,
      behavior: 'auto'
    });
  }, [options.enabled]);

  useEffect(() => {
    const source = sourceRef.current;
    const target = targetRef.current;
    
    if (!source || !target) return;

    const handleScroll = (event: Event) => {
      const now = Date.now();
      
      // Throttle scroll events
      if (now - lastScrollTime.current < options.threshold || 16) {
        return;
      }
      
      lastScrollTime.current = now;
      isScrolling.current = true;
      
      // Determine which element is scrolling
      const scrollingElement = event.target as HTMLElement;
      
      if (scrollingElement === source) {
        syncScroll(source, target);
      } else if (scrollingElement === target) {
        syncScroll(target, source);
      }
      
      // Reset scrolling flag after a short delay
      setTimeout(() => {
        isScrolling.current = false;
      }, 100);
    };

    source.addEventListener('scroll', handleScroll, { passive: true });
    target.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      source.removeEventListener('scroll', handleScroll);
      target.removeEventListener('scroll', handleScroll);
    };
  }, [sourceRef, targetRef, syncScroll, options.threshold]);

  return {
    isScrolling: isScrolling.current
  };
}

// Alternative implementation for percentage-based sync
export function useScrollSyncPercentage(
  sourceRef: React.RefObject<HTMLElement | null>,
  targetRef: React.RefObject<HTMLElement | null>,
  options: ScrollSyncOptions = { enabled: true }
) {
  const isScrolling = useRef(false);

  const syncScroll = useCallback((source: HTMLElement, target: HTMLElement) => {
    if (!options.enabled || isScrolling.current) return;

    const sourceScrollTop = source.scrollTop;
    const sourceScrollHeight = source.scrollHeight - source.clientHeight;
    
    if (sourceScrollHeight <= 0) return;
    
    const scrollPercentage = sourceScrollTop / sourceScrollHeight;
    const targetScrollHeight = target.scrollHeight - target.clientHeight;
    const targetScrollTop = scrollPercentage * targetScrollHeight;
    
    // Use requestAnimationFrame for smooth scrolling
    requestAnimationFrame(() => {
      target.scrollTop = targetScrollTop;
    });
  }, [options.enabled]);

  useEffect(() => {
    const source = sourceRef.current;
    const target = targetRef.current;
    
    if (!source || !target) return;

    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const scrollingElement = document.activeElement;
          
          if (scrollingElement === source) {
            isScrolling.current = true;
            syncScroll(source, target);
          } else if (scrollingElement === target) {
            isScrolling.current = true;
            syncScroll(target, source);
          }
          
          setTimeout(() => {
            isScrolling.current = false;
          }, 50);
          
          ticking = false;
        });
        ticking = true;
      }
    };

    source.addEventListener('scroll', handleScroll, { passive: true });
    target.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      source.removeEventListener('scroll', handleScroll);
      target.removeEventListener('scroll', handleScroll);
    };
  }, [sourceRef, targetRef, syncScroll]);
}
