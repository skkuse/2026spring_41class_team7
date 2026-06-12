'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Icon } from '@iconify/react';

export function SaveSuccessOverlay({
  count,
  onDismiss,
}: {
  count: number;
  onDismiss: () => void;
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const raf = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onDismiss();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onDismiss]);

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center transition-opacity duration-300 ${mounted ? 'opacity-100' : 'opacity-0'}`}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-background/95 backdrop-blur-xl"
        onClick={onDismiss}
      />

      {/* Content */}
      <div
        className={`relative flex flex-col items-center gap-8 px-10 py-4 text-center transition-all duration-500 ease-out ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'}`}
      >
        {/* Icon with pulse rings */}
        <div className="relative flex items-center justify-center">
          <div className="absolute h-40 w-40 animate-ping rounded-full border border-primary/10" style={{ animationDuration: '2.4s' }} />
          <div className="absolute h-32 w-32 animate-ping rounded-full border border-primary/15" style={{ animationDuration: '2s', animationDelay: '0.3s' }} />
          <div className="absolute h-24 w-24 rounded-full border border-primary/20" />
          <div className="flex h-20 w-20 items-center justify-center rounded-full border border-primary/30 bg-primary/10">
            <Icon icon="solar:check-circle-bold" className="text-5xl text-primary" />
          </div>
        </div>

        {/* Text */}
        <div className="space-y-2">
          <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-primary">
            Achievement Unlocked
          </p>
          <h2 className="font-heading text-5xl font-black tracking-tight text-foreground">
            Portfolio Saved
          </h2>
          <p className="font-mono text-sm text-muted-foreground">
            {count} project{count !== 1 ? 's' : ''} saved to your portfolio
          </p>
        </div>

        {/* CTAs */}
        <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
          <Link
            href="/documents"
            className="flex items-center justify-center gap-2 rounded-xl bg-primary px-8 py-3.5 font-mono text-xs font-black uppercase tracking-widest text-primary-foreground shadow-[0_0_40px_rgba(201,100,66,0.3)] transition-opacity hover:opacity-90"
          >
            <Icon icon="solar:document-bold" className="text-base" />
            View Portfolio
          </Link>
          <button
            onClick={onDismiss}
            className="flex items-center justify-center gap-2 rounded-xl border border-border px-8 py-3.5 font-mono text-xs font-bold uppercase tracking-widest text-muted-foreground transition-colors hover:border-foreground/40 hover:text-foreground"
          >
            <Icon icon="solar:pen-2-linear" className="text-base" />
            Keep Editing
          </button>
        </div>

        <p className="font-mono text-[9px] text-muted-foreground/40">
          Esc or click outside to dismiss
        </p>
      </div>
    </div>
  );
}
