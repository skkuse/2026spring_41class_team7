'use client';

import { useState } from 'react';
import { Icon } from '@iconify/react';
import type { ProfileData } from './responsive-profile';

function scoreColor(score: number) {
  if (score >= 80) return 'text-emerald-400';
  if (score >= 60) return 'text-yellow-400';
  return 'text-red-400';
}

export function ProfileMobile({ data }: { data: ProfileData }) {
  const { stats, statsLoading } = data;
  const [copied, setCopied] = useState(false);

  function handleShare() {
    if (!stats) return;
    navigator.clipboard.writeText(`${window.location.origin}/company/talent/${stats.userId}`).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <main className="mx-auto min-h-screen max-w-md border-x border-border p-5 pb-nav-safe">
      {/* Identity */}
      <section className="mb-8 text-center">
        {data.avatarUrl ? (
          <img
            src={data.avatarUrl}
            alt={data.name}
            className="mx-auto mb-4 h-20 w-20 rounded-full border-2 border-primary object-cover"
          />
        ) : (
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full border-2 border-primary bg-primary/10">
            <span className="font-mono text-2xl font-black text-primary">
              {data.name?.[0]?.toUpperCase() ?? '?'}
            </span>
          </div>
        )}
        <h2 className="text-2xl font-black">{data.name || '—'}</h2>
        <p className="text-xs uppercase text-muted-foreground">{data.email || '—'}</p>
      </section>

      {/* Stats */}
      {statsLoading ? (
        <div className="h-28 animate-pulse rounded-2xl border border-border bg-card/40" />
      ) : stats ? (
        <section className="space-y-3">
          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-xl border border-border bg-card p-3 text-center">
              <p className={`font-mono text-xl font-black ${scoreColor(stats.avgScore)}`}>
                {stats.avgScore}
              </p>
              <p className="font-mono text-[9px] text-muted-foreground">avg score</p>
            </div>
            <div className="rounded-xl border border-border bg-card p-3 text-center">
              <p className="font-mono text-xl font-black text-foreground">
                Top {100 - stats.percentile}%
              </p>
              <p className="font-mono text-[9px] text-muted-foreground">percentile</p>
            </div>
            <div className="rounded-xl border border-border bg-card p-3 text-center">
              <p className="font-mono text-xl font-black text-foreground">{stats.assessmentCount}</p>
              <p className="font-mono text-[9px] text-muted-foreground">assessments</p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleShare}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-border py-3 font-mono text-[10px] font-bold uppercase tracking-wide transition-colors hover:bg-muted"
          >
            <Icon
              icon={copied ? 'solar:check-circle-bold' : 'solar:share-linear'}
              className={copied ? 'text-emerald-500' : ''}
            />
            {copied ? 'Link Copied!' : 'Share Profile with Company'}
          </button>
        </section>
      ) : (
        <p className="text-center font-mono text-xs text-muted-foreground">
          Run your first assessment to see stats.
        </p>
      )}
    </main>
  );
}
