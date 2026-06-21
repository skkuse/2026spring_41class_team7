'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { Icon } from '@iconify/react';

import { createBrowserSupabase } from '../lib/supabase/client';
import { useProfile } from '../lib/profile-context';

function Avatar({ avatarUrl, fullName, size = 30 }: { avatarUrl?: string | null; fullName?: string; size?: number }) {
  const initials =
    fullName
      ?.split(' ')
      .slice(0, 2)
      .map((w) => w[0]?.toUpperCase() ?? '')
      .join('') || '?';

  if (avatarUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={avatarUrl}
        alt={fullName ?? 'Avatar'}
        referrerPolicy="no-referrer"
        width={size}
        height={size}
        className="rounded-full object-cover"
        style={{ width: size, height: size }}
      />
    );
  }

  return (
    <div
      className="flex shrink-0 items-center justify-center rounded-full bg-primary/20 font-mono font-bold text-primary"
      style={{ width: size, height: size, fontSize: Math.round(size * 0.36) }}
    >
      {initials}
    </div>
  );
}

export function UserMenu() {
  const router = useRouter();
  const { profile } = useProfile();
  const [email, setEmail] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

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

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setEmail(session?.user?.email ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  async function signOut() {
    try {
      const supabase = createBrowserSupabase();
      await supabase.auth.signOut();
    } catch { /* ignore */ }
    setOpen(false);
    setEmail(null);
    router.push('/');
  }

  if (!email) {
    return (
      <div className="flex items-center gap-2">
        <Link
          href="/onboarding"
          className="rounded-full border border-border bg-card px-3 py-1.5 font-mono text-xs font-medium text-foreground transition-colors hover:border-primary hover:text-primary"
        >
          Sign in
        </Link>
      </div>
    );
  }

  const displayName = profile?.fullName || email.split('@')[0];

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1.5 rounded-full border border-transparent p-1 pr-2 transition-colors hover:border-border hover:bg-muted"
        aria-label="Account menu"
      >
        <Avatar avatarUrl={profile?.avatarUrl} fullName={profile?.fullName} size={28} />
        <Icon
          icon="solar:alt-arrow-down-linear"
          className={`text-xs text-muted-foreground transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-64 overflow-hidden rounded-xl border border-border bg-card shadow-2xl">
          {/* Identity header */}
          <div className="flex items-center gap-3 border-b border-border px-4 py-3">
            <Avatar avatarUrl={profile?.avatarUrl} fullName={profile?.fullName} size={38} />
            <div className="min-w-0">
              <p className="truncate font-mono text-xs font-bold text-foreground">{displayName}</p>
              <p className="truncate font-mono text-[10px] text-muted-foreground">{email}</p>
              {profile?.isPro && (
                <span className="mt-0.5 inline-block rounded bg-primary/15 px-1.5 py-0.5 font-mono text-[8px] font-bold uppercase tracking-wider text-primary">
                  Pro
                </span>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="p-1.5 space-y-0.5">
            <Link
              href="/profile"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 rounded-lg px-3 py-2 font-mono text-xs text-foreground transition-colors hover:bg-muted"
            >
              <Icon icon="solar:user-circle-linear" className="text-base text-muted-foreground" />
              Profile
            </Link>
            <Link
              href="/settings"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 rounded-lg px-3 py-2 font-mono text-xs text-foreground transition-colors hover:bg-muted"
            >
              <Icon icon="hugeicons:settings-01" className="text-base text-muted-foreground" />
              Settings
            </Link>
            {profile?.userType !== 'COMPANY' && (
              <Link
                href="/onboarding/company"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2.5 rounded-lg px-3 py-2 font-mono text-xs text-foreground transition-colors hover:bg-muted"
              >
                <Icon icon="solar:buildings-linear" className="text-base text-muted-foreground" />
                Switch to Company
              </Link>
            )}
            <div className="my-1 border-t border-border" />
            <button
              type="button"
              onClick={() => void signOut()}
              className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 font-mono text-xs text-destructive transition-colors hover:bg-destructive/10"
            >
              <Icon icon="solar:logout-2-linear" className="text-base" />
              Sign out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
