'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

import { useProfile } from '../../lib/profile-context';

export default function CompanyLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { profile, isLoading } = useProfile();

  useEffect(() => {
    if (isLoading) return;
    if (!profile) return;
    if (profile.userType === null) router.replace('/onboarding/role');
    else if (profile.userType === 'DEVELOPER') router.replace('/home');
  }, [isLoading, profile, router]);

  return <>{children}</>;
}
