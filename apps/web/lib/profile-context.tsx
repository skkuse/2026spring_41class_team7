'use client';

import { createContext, useContext, useEffect, useState } from 'react';

import { useApi } from './api-context';

export type UserType = 'DEVELOPER' | 'COMPANY';

type Profile = {
  userId: string;
  fullName: string;
  email: string;
  role: string;
  location: string;
  website: string | null;
  avatarUrl?: string | null;
  isPro: boolean;
  userType: UserType | null;
  companyName: string | null;
  industry: string | null;
  allowContact: boolean;
};

type ProfileContextValue = {
  profile: Profile | null;
  isLoading: boolean;
  refetch: () => void;
};

const ProfileContext = createContext<ProfileContextValue | null>(null);

export function ProfileProvider({ children }: { children: React.ReactNode }) {
  const { authToken, get } = useApi();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [version, setVersion] = useState(0);

  useEffect(() => {
    if (!authToken) {
      setProfile(null);
      return;
    }
    setIsLoading(true);
    get<Profile>('/v1/me')
      .then(setProfile)
      .catch(() => setProfile(null))
      .finally(() => setIsLoading(false));
  }, [authToken, version, get]);

  return (
    <ProfileContext.Provider value={{ profile, isLoading, refetch: () => setVersion((v) => v + 1) }}>
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfile() {
  const context = useContext(ProfileContext);
  if (!context) throw new Error('useProfile must be used inside ProfileProvider.');
  return context;
}
