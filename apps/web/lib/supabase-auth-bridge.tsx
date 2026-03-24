'use client';

import { useEffect } from 'react';

import { DEFAULT_RC_APP_USER_ID } from './revenuecat';
import { createBrowserSupabase } from './supabase/client';
import { useApi } from './api-context';
import { useBilling } from './billing-context';

/**
 * Keeps API `Authorization` and RevenueCat `appUserId` aligned with the Supabase session.
 */
export function SupabaseAuthBridge({ children }: { children: React.ReactNode }) {
  const { setAuthToken } = useApi();
  const { setAppUserId } = useBilling();

  useEffect(() => {
    let cancelled = false;

    function syncFromSession(accessToken: string | null, userId: string | null) {
      if (cancelled) return;
      setAuthToken(accessToken);
      setAppUserId(userId ?? DEFAULT_RC_APP_USER_ID);
    }

    let supabase: ReturnType<typeof createBrowserSupabase>;
    try {
      supabase = createBrowserSupabase();
    } catch {
      return;
    }

    void supabase.auth.getSession().then(({ data: { session } }) => {
      syncFromSession(session?.access_token ?? null, session?.user?.id ?? null);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      syncFromSession(session?.access_token ?? null, session?.user?.id ?? null);
    });

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, [setAuthToken, setAppUserId]);

  return <>{children}</>;
}
