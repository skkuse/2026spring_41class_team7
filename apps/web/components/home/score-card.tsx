'use client';

import { Icon } from '@iconify/react';
import Link from 'next/link';
import { useState } from 'react';

import { ShareModal } from '../share-modal';

export type DeveloperStats = {
  userId: string;
  avgScore: number;
  topScore: number;
  assessmentCount: number;
  percentile: number;
  rank: number;
  totalRankedDevelopers: number;
  history: {
    daily: HistoryPoint[];
    weekly: HistoryPoint[];
    monthly: HistoryPoint[];
  };
};

export type HistoryPoint = {
  label: string;
  date: string;
  avgScore: number;
  count: number;
};

function scoreColor(score: number) {
  if (score >= 80) return 'text-emerald-400';
  if (score >= 60) return 'text-yellow-400';
  return 'text-red-400';
}

function scoreRingColor(score: number) {
  if (score >= 80) return '#4ade80';
  if (score >= 60) return '#facc15';
  return '#f87171';
}

function ScoreRing({ score, size = 72 }: { score: number; size?: number }) {
  const r = (size - 8) / 2;
  const circ = 2 * Math.PI * r;
  const filled = (score / 100) * circ;
  const color = scoreRingColor(score);
  return (
    <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={6} />
      <circle
        cx={size / 2} cy={size / 2} r={r} fill="none"
        stroke={color} strokeWidth={6}
        strokeDasharray={`${filled} ${circ - filled}`}
        strokeLinecap="round"
      />
    </svg>
  );
}

type Props = { stats: DeveloperStats; compact?: boolean };

export function ScoreCard({ stats, compact = false }: Props) {
  const [shareOpen, setShareOpen] = useState(false);

  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://jobclaw.fyi';
  const shareUrl = `${origin}/company/talent/${stats.userId}`;
  const ogImageUrl = `${origin}/company/talent/${stats.userId}/opengraph-image`;

  return (
    <div className="rounded-2xl border border-border bg-card p-5 space-y-4">
      {/* Top row: ring + headline stats */}
      <div className="flex items-center gap-4">
        <div className="relative flex-shrink-0">
          <ScoreRing score={stats.avgScore} />
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={`font-mono text-xl font-black leading-none ${scoreColor(stats.avgScore)}`}>
              {stats.avgScore}
            </span>
            <span className="font-mono text-[9px] text-muted-foreground">/100</span>
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-muted-foreground mb-1">
            Avg Assessment Score
          </p>
          <div className="flex flex-wrap gap-x-4 gap-y-1">
            <div>
              <span className="font-mono text-xs font-bold text-foreground">
                Top {100 - stats.percentile}%
              </span>
              <span className="ml-1 font-mono text-[9px] text-muted-foreground">percentile</span>
            </div>
            <div>
              <span className="font-mono text-xs font-bold text-foreground">
                #{stats.rank}
              </span>
              <span className="ml-1 font-mono text-[9px] text-muted-foreground">
                of {stats.totalRankedDevelopers} devs
              </span>
            </div>
            <div>
              <span className="font-mono text-xs font-bold text-foreground">
                {stats.assessmentCount}
              </span>
              <span className="ml-1 font-mono text-[9px] text-muted-foreground">assessments</span>
            </div>
          </div>

          {/* Percentile bar */}
          <div className="mt-2 h-1.5 w-full rounded-full bg-muted overflow-hidden">
            <div
              className="h-full rounded-full transition-all"
              style={{
                width: `${stats.percentile}%`,
                background: scoreRingColor(stats.avgScore),
              }}
            />
          </div>
        </div>
      </div>

      {/* CTAs */}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setShareOpen(true)}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-border py-2 font-mono text-[10px] font-bold uppercase tracking-wide transition-colors hover:bg-muted"
        >
          <Icon icon="solar:share-linear" className="text-sm" />
          Share with Company
        </button>

        {compact && (
          <Link
            href="/profile"
            className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-primary/10 py-2 font-mono text-[10px] font-bold uppercase tracking-wide text-primary transition-colors hover:bg-primary/20"
          >
            <Icon icon="solar:chart-linear" className="text-sm" />
            View Progress
          </Link>
        )}
      </div>

      {shareOpen && (
        <ShareModal
          title="My Developer Profile"
          shareUrl={shareUrl}
          ogImageUrl={ogImageUrl}
          shareText="Check out my developer assessment scores on Jobclaw — AI-powered analysis of real GitHub repos."
          onClose={() => setShareOpen(false)}
        />
      )}
    </div>
  );
}
