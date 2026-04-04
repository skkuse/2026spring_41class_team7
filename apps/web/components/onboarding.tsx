'use client';

import { Icon } from '@iconify/react';
import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useState } from 'react';

import { createBrowserSupabase } from '../lib/supabase/client';

const BG_URL =
  'https://ggrhecslgdflloszjkwl.supabase.co/storage/v1/object/public/user-assets/76524ixEd5g/components/GMq8CbiyhST.png';

export function Onboarding() {
  const searchParams = useSearchParams();
  const authError = searchParams.get('error');

  const [loading, setLoading] = useState(false);
  const [oauthMessage, setOauthMessage] = useState<string | null>(null);
  const [authMessage, setAuthMessage] = useState<string | null>(
    authError === 'auth' ? 'Authentication failed. Try again.' : null,
  );

  const redirectTo = () => `${window.location.origin}/auth/callback`;

  async function signInWithGoogle() {
    setLoading(true);
    setOauthMessage(null);
    setAuthMessage(null);
    try {
      const supabase = createBrowserSupabase();
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: redirectTo() },
      });
      if (error) throw error;
    } catch (err) {
      setOauthMessage(err instanceof Error ? err.message : 'Google sign-in failed.');
      setLoading(false);
    }
  }

  async function signInWithLinkedIn() {
    setLoading(true);
    setOauthMessage(null);
    setAuthMessage(null);
    try {
      const supabase = createBrowserSupabase();
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'linkedin_oidc',
        options: { redirectTo: redirectTo() },
      });
      if (error) throw error;
    } catch (err) {
      setOauthMessage(
        err instanceof Error
          ? err.message
          : 'LinkedIn sign-in failed. Enable LinkedIn (OIDC) in Supabase.',
      );
      setLoading(false);
    }
  }

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-background p-6 font-sans text-foreground">
      <div className="absolute inset-0 z-0">
        <Image
          alt="Background"
          src={BG_URL}
          fill
          className="object-cover opacity-40 mix-blend-screen"
          sizes="100vw"
          priority
        />
        <div className="absolute inset-0 bg-linear-to-t from-background via-background/80 to-transparent" />
      </div>
      <div className="relative z-10 w-full max-w-md animate-onboarding-enter">
        <div className="mb-12 flex flex-col items-center">
          <div className="mb-4 flex size-12 items-center justify-center rounded-xl bg-primary shadow-[0_0_30px_rgba(0,229,255,0.4)]">
            <Icon icon="solar:bolt-bold" className="text-3xl text-primary-foreground" />
          </div>
          <span className="font-heading text-3xl font-black tracking-tighter">
            Job<span className="text-primary">Script</span>
          </span>
        </div>
        <div className="mb-10 text-center">
          <h1 className="mb-3 font-heading text-4xl font-bold tracking-tight">
            Claim your technical identity.
          </h1>
          <p className="leading-relaxed text-muted-foreground">
            Join 15,000+ engineers leveraging AI to transform their code into career opportunities.
          </p>
        </div>
        <div className="space-y-4">
          <button
            type="button"
            disabled={loading}
            onClick={() => void signInWithGoogle()}
            className="flex h-14 w-full items-center justify-center gap-3 rounded-2xl bg-white font-bold text-black shadow-xl transition-all hover:bg-white/90 active:scale-[0.98] disabled:opacity-50"
          >
            <Icon icon="logos:google-icon" className="text-xl" />
            Continue with Google
          </button>
          <button
            type="button"
            disabled={loading}
            onClick={() => void signInWithLinkedIn()}
            className="flex h-14 w-full items-center justify-center gap-3 rounded-2xl bg-[#0077B5] font-bold text-white shadow-xl transition-all hover:bg-[#0077B5]/90 active:scale-[0.98] disabled:opacity-50"
          >
            <Icon icon="mdi:linkedin" className="text-2xl" />
            Continue with LinkedIn
          </button>
          {oauthMessage ? (
            <p className="text-center text-sm text-primary" role="alert">
              {oauthMessage}
            </p>
          ) : null}
        </div>
        {authMessage ? (
          <p className="mt-4 text-center text-sm text-primary" role="alert">
            {authMessage}
          </p>
        ) : null}
        <p className="mt-12 text-center text-xs leading-relaxed text-muted-foreground">
          By continuing, you agree to our{' '}
          <a href="#" className="text-primary underline-offset-4 hover:underline">
            Terms of Service
          </a>{' '}
          and{' '}
          <a href="#" className="text-primary underline-offset-4 hover:underline">
            Privacy Policy
          </a>
          .
        </p>
        <div className="mt-8 flex justify-center">
          <Link
            href="/"
            className="group flex items-center gap-2 font-mono text-[10px] font-black uppercase tracking-widest text-muted-foreground transition-colors hover:text-foreground"
          >
            <Icon
              icon="solar:arrow-left-linear"
              className="transition-transform group-hover:-translate-x-1"
            />
            Back to JobScript
          </Link>
        </div>
      </div>
      <div className="absolute -bottom-24 -left-24 -z-10 size-64 rounded-full bg-primary/20 blur-[100px]" />
      <div className="absolute -top-24 -right-24 -z-10 size-64 rounded-full bg-chart-2/20 blur-[100px]" />
    </div>
  );
}
