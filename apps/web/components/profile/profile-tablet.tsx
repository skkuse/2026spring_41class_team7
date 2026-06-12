'use client';

import { useState } from 'react';
import { Icon } from '@iconify/react';
import type { ProfileData } from './responsive-profile';

function scoreColor(score: number) {
  if (score >= 80) return 'text-emerald-400';
  if (score >= 60) return 'text-yellow-400';
  return 'text-red-400';
}

export function ProfileTablet({ data }: { data: ProfileData }) {
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
    <main className="mx-auto min-h-screen max-w-2xl border-x border-border px-8 py-10 pb-nav-safe">
      <h1 className="mb-2 font-home-heading text-2xl font-bold uppercase tracking-tight">Profile</h1>
      <p className="mb-8 font-home-mono text-sm text-muted-foreground">Developer analytics · v1.0</p>

      {/* Identity */}
      <div className="mb-8 flex flex-col gap-6 sm:flex-row sm:items-center">
        {data.avatarUrl ? (
          <img
            src={data.avatarUrl}
            alt={data.name}
            className="mx-auto h-24 w-24 shrink-0 rounded-full border-2 border-primary object-cover sm:mx-0"
          />
        ) : (
          <div className="mx-auto flex h-24 w-24 shrink-0 items-center justify-center rounded-full border-2 border-primary bg-primary/10 sm:mx-0">
            <span className="font-mono text-3xl font-black text-primary">
              {data.name?.[0]?.toUpperCase() ?? '?'}
            </span>
          </div>
        )}
        <div className="text-center sm:text-left">
          <h2 className="font-home-heading text-3xl font-black">{data.name || '—'}</h2>
          <p className="mt-1 font-home-mono text-xs uppercase text-muted-foreground">{data.email || '—'}</p>
        </div>
      </div>

      {/* Stats */}
      {statsLoading ? (
        <div className="h-32 animate-pulse rounded-2xl border border-border bg-card/40" />
      ) : stats ? (
        <>
          <div className="mb-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div className="rounded-2xl border border-border bg-card p-4 text-center">
              <p className={`font-mono text-2xl font-black ${scoreColor(stats.avgScore)}`}>
                {stats.avgScore}
              </p>
              <p className="font-mono text-[9px] text-muted-foreground">avg score</p>
            </div>
            <div className="rounded-2xl border border-border bg-card p-4 text-center">
              <p className="font-mono text-2xl font-black text-foreground">
                Top {100 - stats.percentile}%
              </p>
              <p className="font-mono text-[9px] text-muted-foreground">percentile</p>
            </div>
            <div className="rounded-2xl border border-border bg-card p-4 text-center">
              <p className="font-mono text-2xl font-black text-foreground">#{stats.rank}</p>
              <p className="font-mono text-[9px] text-muted-foreground">
                of {stats.totalRankedDevelopers}
              </p>
            </div>
            <div className="rounded-2xl border border-border bg-card p-4 text-center">
              <p className="font-mono text-2xl font-black text-foreground">{stats.assessmentCount}</p>
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
        </>
      ) : (
        <p className="text-center font-mono text-xs text-muted-foreground">
          Run your first assessment to see stats.
        </p>
      )}
    </main>
  );
}
