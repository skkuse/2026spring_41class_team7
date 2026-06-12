'use client';

import { useEffect, useState } from 'react';

import { useApi } from '../../lib/api-context';
import { useProfile } from '../../lib/profile-context';
import { useHomeBreakpoint } from '../../hooks/use-breakpoint';
import { DashboardBottomNav } from '../home/dashboard-bottom-nav';
import { ProfileDesktop } from './profile-desktop';
import { ProfileMobile } from './profile-mobile';
import { ProfileTablet } from './profile-tablet';
import type { DeveloperStats } from '../home/score-card';

export type ProfileData = {
  name: string;
  email: string;
  avatarUrl: string | null;
  stats: DeveloperStats | null;
  statsLoading: boolean;
  statsError?: string | null;
};

export function ResponsiveProfile() {
  const bp = useHomeBreakpoint();
  const { get, authToken } = useApi();
  const { profile } = useProfile();
  const [stats, setStats] = useState<DeveloperStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [statsError, setStatsError] = useState<string | null>(null);

  useEffect(() => {
    if (!authToken) {
      setStatsLoading(false);
      return;
    }
    setStatsLoading(true);
    setStatsError(null);
    get<DeveloperStats>('/v1/profile/stats')
      .then((data) => { setStats(data); setStatsLoading(false); })
      .catch((e: unknown) => {
        setStatsError(e instanceof Error ? e.message : String(e));
        setStats(null);
        setStatsLoading(false);
      });
  }, [get, authToken]);

  const profileData: ProfileData = {
    name: profile?.fullName ?? profile?.email?.split('@')[0] ?? '',
    email: profile?.email ?? '',
    avatarUrl: profile?.avatarUrl ?? null,
    stats,
    statsLoading,
    statsError,
  };

  const nav =
    bp === 'mobile' || bp === 'tablet' ? (
      <DashboardBottomNav tone={bp === 'tablet' ? 'tablet' : 'mobile'} />
    ) : null;

  if (bp === 'desktop') {
    return <ProfileDesktop data={profileData} />;
  }
  if (bp === 'tablet') {
    return (
      <>
        <ProfileTablet data={profileData} />
        {nav}
      </>
    );
  }
  return (
    <>
      <ProfileMobile data={profileData} />
      {nav}
    </>
  );
}
