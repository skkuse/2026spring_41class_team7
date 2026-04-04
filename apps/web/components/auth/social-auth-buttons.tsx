'use client';

import { Icon } from '@iconify/react';
import { useState } from 'react';

import { createBrowserSupabase } from '../../lib/supabase/client';

type Props = {
  /** When false, buttons do nothing visually (parent handles loading). */
  disabled?: boolean;
  className?: string;
};

export function SocialAuthButtons({ disabled = false, className }: Props) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const redirectTo = () => `${window.location.origin}/auth/callback`;

  async function signInWithGoogle() {
    setLoading(true);
    setMessage(null);
    try {
      const supabase = createBrowserSupabase();
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: redirectTo() },
      });
      if (error) throw error;
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Google sign-in failed.');
      setLoading(false);
    }
  }

  async function signInWithLinkedIn() {
    setLoading(true);
    setMessage(null);
    try {
      const supabase = createBrowserSupabase();
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'linkedin_oidc',
        options: { redirectTo: redirectTo() },
      });
      if (error) throw error;
    } catch (err) {
      setMessage(
        err instanceof Error
          ? err.message
          : 'LinkedIn sign-in failed. Enable LinkedIn (OIDC) in Supabase Auth providers.',
      );
      setLoading(false);
    }
  }

  const busy = loading || disabled;

  return (
    <div className={className}>
      <div className="space-y-4">
        <button
          type="button"
          disabled={busy}
          onClick={() => void signInWithGoogle()}
          className="flex h-14 w-full items-center justify-center gap-3 rounded-2xl bg-white font-bold text-black shadow-xl transition-all hover:bg-white/90 active:scale-[0.98] disabled:opacity-50"
        >
          <Icon icon="logos:google-icon" className="text-xl" />
          Continue with Google
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={() => void signInWithLinkedIn()}
          className="flex h-14 w-full items-center justify-center gap-3 rounded-2xl bg-[#0077B5] font-bold text-white shadow-xl transition-all hover:bg-[#0077B5]/90 active:scale-[0.98] disabled:opacity-50"
        >
          <Icon icon="mdi:linkedin" className="text-2xl" />
          Continue with LinkedIn
        </button>
      </div>
      {message ? (
        <p className="mt-4 text-center text-sm text-primary" role="alert">
          {message}
        </p>
      ) : null}
    </div>
  );
}
