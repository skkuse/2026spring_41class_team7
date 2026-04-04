'use client';

import { usePathname } from 'next/navigation';

import { useHomeBreakpoint } from '../../hooks/use-breakpoint';
import { DashboardDesktopHeader } from './dashboard-desktop-header';
import { isDashboardRoute } from './dashboard-nav-items';

export function DashboardChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const bp = useHomeBreakpoint();
  const showDesktopNav = bp === 'desktop' && isDashboardRoute(pathname);

  return (
    <>
      {showDesktopNav ? <DashboardDesktopHeader /> : null}
      {children}
    </>
  );
}
