'use client';

import { useSyncExternalStore } from 'react';

export type HomeBreakpoint = 'mobile' | 'tablet' | 'desktop';

const q = {
  tablet: '(min-width: 768px) and (max-width: 1023px)',
  desktop: '(min-width: 1024px)',
} as const;

function subscribe(onChange: () => void) {
  const mTablet = window.matchMedia(q.tablet);
  const mDesktop = window.matchMedia(q.desktop);
  const handler = () => onChange();
  mTablet.addEventListener('change', handler);
  mDesktop.addEventListener('change', handler);
  return () => {
    mTablet.removeEventListener('change', handler);
    mDesktop.removeEventListener('change', handler);
  };
}

function getSnapshot(): HomeBreakpoint {
  if (window.matchMedia(q.desktop).matches) return 'desktop';
  if (window.matchMedia(q.tablet).matches) return 'tablet';
  return 'mobile';
}

/** SSR / first paint: mobile-first to match small screens and reduce layout jump. */
function getServerSnapshot(): HomeBreakpoint {
  return 'mobile';
}

export function useHomeBreakpoint(): HomeBreakpoint {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
