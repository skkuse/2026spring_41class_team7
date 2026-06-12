'use client';

import { useEffect, useState } from 'react';

import { useApi } from '../../lib/api-context';
import { createBrowserSupabase } from '../../lib/supabase/client';
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
};

export function ResponsiveProfile() {
  const bp = useHomeBreakpoint();
  const { get, authToken } = useApi();
  const [profileData, setProfileData] = useState<ProfileData>({
    name: '',
    email: '',
    avatarUrl: null,
    stats: null,
    statsLoading: true,
  });

  useEffect(() => {
    let cancelled = false;
    let supabase: ReturnType<typeof createBrowserSupabase>;
    try {
      supabase = createBrowserSupabase();
    } catch {
      return;
    }

    supabase.auth.getUser().then(({ data: { user } }) => {
      if (cancelled || !user) return;
      setProfileData((prev) => ({
        ...prev,
        name:
          user.user_metadata?.full_name ??
          user.user_metadata?.name ??
          user.email?.split('@')[0] ??
          '',
        email: user.email ?? '',
        avatarUrl: user.user_metadata?.avatar_url ?? null,
      }));
    });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!authToken) {
      setProfileData((prev) => ({ ...prev, statsLoading: false }));
      return;
    }
    get<DeveloperStats>('/v1/profile/stats')
      .then((data) => setProfileData((prev) => ({ ...prev, stats: data, statsLoading: false })))
      .catch(() => setProfileData((prev) => ({ ...prev, stats: null, statsLoading: false })));
  }, [get, authToken]);

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
