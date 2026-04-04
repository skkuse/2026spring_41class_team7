'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

import { SocialAuthButtons } from '../auth/social-auth-buttons';
import { createBrowserSupabase } from '../../lib/supabase/client';

/**
 * On tablet/desktop `/home`, guests often land here first. Surface the same Google / LinkedIn
 * entry points as `/onboarding` so they are not “missing.”
 */
export function HomeGuestSocial() {
  const [ready, setReady] = useState(false);
  const [signedIn, setSignedIn] = useState(false);

  useEffect(() => {
    let supabase: ReturnType<typeof createBrowserSupabase>;
    try {
      supabase = createBrowserSupabase();
    } catch {
      setReady(true);
      return;
    }

    void supabase.auth.getUser().then(({ data }) => {
      setSignedIn(!!data.user);
      setReady(true);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_e, session) => {
      setSignedIn(!!session?.user);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (!ready || signedIn) {
    return null;
  }

  return (
    <section className="mb-10 rounded-2xl border border-border/60 bg-card/60 p-5 backdrop-blur-sm">
      <p className="mb-1 text-center font-home-mono text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
        Sign in to sync
      </p>
      <p className="mb-4 text-center text-xs text-muted-foreground">
        Google, LinkedIn, or{' '}
        <Link href="/onboarding" className="text-primary underline-offset-4 hover:underline">
          full onboarding
        </Link>
        .
      </p>
      <SocialAuthButtons />
    </section>
  );
}
