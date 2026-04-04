'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import { createBrowserSupabase } from '../lib/supabase/client';

export function UserMenu() {
  const router = useRouter();
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    let supabase: ReturnType<typeof createBrowserSupabase>;
    try {
      supabase = createBrowserSupabase();
    } catch {
      return;
    }

    void supabase.auth.getUser().then(({ data }) => {
      setEmail(data.user?.email ?? null);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_e, session) => {
      setEmail(session?.user?.email ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  async function signOut() {
    try {
      const supabase = createBrowserSupabase();
      await supabase.auth.signOut();
    } catch {
      /* ignore */
    }
    router.refresh();
    setEmail(null);
  }

  if (email) {
    return (
      <div className="flex flex-wrap items-center gap-3 text-sm">
        <span className="text-muted-foreground truncate max-w-[200px]">{email}</span>
        <button type="button" onClick={() => void signOut()} className="underline text-primary">
          Sign out
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center justify-end gap-2">
      <Link
        href="/onboarding"
        className="rounded-full border border-border bg-card px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:border-primary hover:text-primary"
      >
        Google / LinkedIn
      </Link>
      <Link href="/onboarding" className="text-sm font-medium text-primary hover:underline">
        Sign in
      </Link>
    </div>
  );
}
