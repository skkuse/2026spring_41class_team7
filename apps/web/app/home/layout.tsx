'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

import { useProfile } from '../../lib/profile-context';

export default function HomeLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { profile, isLoading } = useProfile();

  useEffect(() => {
    if (isLoading) return;
    if (!profile) return;
    if (profile.userType === null) router.replace('/onboarding/role');
    else if (profile.userType === 'COMPANY') router.replace('/company/talent');
  }, [isLoading, profile, router]);

  const shouldRedirect =
    !isLoading && !!profile && (profile.userType === null || profile.userType === 'COMPANY');
  if (isLoading || shouldRedirect) return null;

  return <>{children}</>;
}
