'use client';

import { useHomeBreakpoint } from '../../hooks/use-breakpoint';
import { DashboardBottomNav } from '../home/dashboard-bottom-nav';
import { ProfileDesktop } from './profile-desktop';
import { ProfileMobile } from './profile-mobile';
import { ProfileTablet } from './profile-tablet';

export function ResponsiveProfile() {
  const bp = useHomeBreakpoint();

  const nav =
    bp === 'mobile' || bp === 'tablet' ? (
      <DashboardBottomNav tone={bp === 'tablet' ? 'tablet' : 'mobile'} />
    ) : null;

  if (bp === 'desktop') {
    return <ProfileDesktop />;
  }
  if (bp === 'tablet') {
    return (
      <>
        <ProfileTablet />
        {nav}
      </>
    );
  }
  return (
    <>
      <ProfileMobile />
      {nav}
    </>
  );
}
