'use client';

import { useHomeBreakpoint } from '../../hooks/use-breakpoint';
import { DashboardBottomNav } from '../home/dashboard-bottom-nav';
import { PreviewDesktop } from './preview-desktop';
import { PreviewMobile } from './preview-mobile';
import { PreviewTablet } from './preview-tablet';

export function ResponsivePreview() {
  const bp = useHomeBreakpoint();

  const nav =
    bp === 'mobile' || bp === 'tablet' ? (
      <DashboardBottomNav tone={bp === 'tablet' ? 'tablet' : 'mobile'} />
    ) : null;

  if (bp === 'desktop') {
    return <PreviewDesktop />;
  }
  if (bp === 'tablet') {
    return (
      <>
        <PreviewTablet />
        {nav}
      </>
    );
  }
  return (
    <>
      <PreviewMobile />
      {nav}
    </>
  );
}
