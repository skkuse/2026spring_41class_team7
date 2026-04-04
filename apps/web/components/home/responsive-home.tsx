'use client';

import { useHomeBreakpoint } from '../../hooks/use-breakpoint';
import { HomeDesktop } from './home-desktop';
import { HomeMobile } from './home-mobile';
import { HomeTablet } from './home-tablet';

export function ResponsiveHome() {
  const bp = useHomeBreakpoint();

  if (bp === 'desktop') {
    return <HomeDesktop />;
  }
  if (bp === 'tablet') {
    return <HomeTablet />;
  }
  return <HomeMobile />;
}
