'use client';

import { useEffect, useState } from 'react';

import { useApi } from '../../lib/api-context';
import { createBrowserSupabase } from '../../lib/supabase/client';
import { useHomeBreakpoint } from '../../hooks/use-breakpoint';
import { DashboardBottomNav } from '../home/dashboard-bottom-nav';
import { ProfileDesktop } from './profile-desktop';
import { ProfileMobile } from './profile-mobile';
import { ProfileTablet } from './profile-tablet';

export type ProfileData = {
  name: string;
  email: string;
  avatarUrl: string | null;
  assessmentCount: number;
};

export function ResponsiveProfile() {
  const bp = useHomeBreakpoint();
  const { get, authToken } = useApi();
  const [profileData, setProfileData] = useState<ProfileData>({
    name: '',
    email: '',
    avatarUrl: null,
    assessmentCount: 0,
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
    if (!authToken) return;
    get<{ items: unknown[]; total: number }>('/v1/assessments')
      .then((data) => setProfileData((prev) => ({ ...prev, assessmentCount: data.total })))
      .catch(() => {});
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
