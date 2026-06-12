'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Icon } from '@iconify/react';
import type { ProfileData } from './responsive-profile';
import type { HistoryPoint } from '../home/score-card';

type Range = 'daily' | 'weekly' | 'monthly';

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

function ScoreRing({ score, size = 96 }: { score: number; size?: number }) {
  const r = (size - 10) / 2;
  const circ = 2 * Math.PI * r;
  const filled = (score / 100) * circ;
  const color = scoreRingColor(score);
  return (
    <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={8} />
      <circle
        cx={size / 2} cy={size / 2} r={r} fill="none"
        stroke={color} strokeWidth={8}
        strokeDasharray={`${filled} ${circ - filled}`}
        strokeLinecap="round"
      />
    </svg>
  );
}

function LineChart({ points }: { points: HistoryPoint[] }) {
  if (points.length < 2) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="font-mono text-[10px] text-muted-foreground">Not enough data for this range</p>
      </div>
    );
  }

  const W = 600;
  const H = 160;
  const pad = { top: 12, right: 16, bottom: 28, left: 32 };
  const cw = W - pad.left - pad.right;
  const ch = H - pad.top - pad.bottom;

  const scores = points.map((p) => p.avgScore);
  const minS = Math.max(0, Math.min(...scores) - 8);
  const maxS = Math.min(100, Math.max(...scores) + 8);
  const range = maxS - minS || 1;

  const px = (i: number) => pad.left + (i / (points.length - 1)) * cw;
  const py = (s: number) => pad.top + ((maxS - s) / range) * ch;

  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${px(i)},${py(p.avgScore)}`).join(' ');
  const areaPath = `${linePath} L${px(points.length - 1)},${H - pad.bottom} L${px(0)},${H - pad.bottom}Z`;

  const labelIndices = points.length <= 6
    ? points.map((_, i) => i)
    : [0, Math.floor((points.length - 1) / 3), Math.floor((2 * (points.length - 1)) / 3), points.length - 1];

  const yTicks = [minS, Math.round((minS + maxS) / 2), maxS].filter(
    (v, i, a) => a.indexOf(v) === i,
  );

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full overflow-visible">
      <defs>
        <linearGradient id="line-area" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#818cf8" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#818cf8" stopOpacity="0" />
        </linearGradient>
      </defs>
      {yTicks.map((v) => (
        <g key={v}>
          <line
            x1={pad.left} y1={py(v)} x2={pad.left + cw} y2={py(v)}
            stroke="rgba(255,255,255,0.05)" strokeWidth="1"
          />
          <text x={pad.left - 4} y={py(v)} textAnchor="end" dominantBaseline="middle"
            fontSize="8" fill="rgba(255,255,255,0.35)">{Math.round(v)}</text>
        </g>
      ))}
      <path d={areaPath} fill="url(#line-area)" />
      <path d={linePath} fill="none" stroke="#818cf8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      {points.map((p, i) => (
        <circle key={i} cx={px(i)} cy={py(p.avgScore)} r="3.5"
          fill="#818cf8" stroke="var(--background, #0a0a0a)" strokeWidth="2" />
      ))}
      {labelIndices.map((i) => (
        <text key={i} x={px(i)} y={H - 4} textAnchor="middle" fontSize="8" fill="rgba(255,255,255,0.35)">
          {points[i].label}
        </text>
      ))}
    </svg>
  );
}

export function ProfileDesktop({ data }: { data: ProfileData }) {
  const [range, setRange] = useState<Range>('weekly');
  const { stats, statsLoading } = data;

  const historyPoints = stats?.history[range] ?? [];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <main className="mx-auto max-w-4xl px-8 py-12">
        {/* Header */}
        <div className="mb-10 flex items-center gap-6">
          {data.avatarUrl ? (
            <img
              src={data.avatarUrl}
              alt={data.name}
              className="h-16 w-16 rounded-full border-2 border-primary object-cover"
            />
          ) : (
            <div className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-primary bg-primary/10">
              <span className="font-mono text-xl font-black text-primary">
                {data.name?.[0]?.toUpperCase() ?? '?'}
              </span>
            </div>
          )}
          <div>
            <h1 className="font-mono text-2xl font-black">{data.name || '—'}</h1>
            <p className="font-mono text-xs text-muted-foreground">{data.email || '—'}</p>
          </div>
          <Link
            href="/home"
            className="ml-auto flex items-center gap-2 rounded-lg border border-border px-4 py-2 font-mono text-xs transition-colors hover:bg-muted"
          >
            <Icon icon="solar:arrow-left-linear" />
            Back to Home
          </Link>
        </div>

        {statsLoading ? (
          <div className="space-y-4">
            <div className="h-32 animate-pulse rounded-2xl border border-border bg-card/40" />
            <div className="h-48 animate-pulse rounded-2xl border border-border bg-card/40" />
          </div>
        ) : stats ? (
          <>
            {/* Stats grid */}
            <div className="mb-8 grid grid-cols-4 gap-4">
              {/* Avg score ring */}
              <div className="col-span-1 flex flex-col items-center justify-center rounded-2xl border border-border bg-card p-5">
                <div className="relative">
                  <ScoreRing score={stats.avgScore} />
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className={`font-mono text-2xl font-black leading-none ${scoreColor(stats.avgScore)}`}>
                      {stats.avgScore}
                    </span>
                    <span className="font-mono text-[9px] text-muted-foreground">/100</span>
                  </div>
                </div>
                <p className="mt-2 font-mono text-[9px] uppercase tracking-widest text-muted-foreground">
                  Avg Score
                </p>
              </div>

              {/* Percentile */}
              <div className="flex flex-col justify-between rounded-2xl border border-border bg-card p-5">
                <p className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground">
                  Percentile
                </p>
                <div>
                  <p className="font-mono text-3xl font-black text-foreground">
                    Top {100 - stats.percentile}%
                  </p>
                  <div className="mt-2 h-1.5 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${stats.percentile}%`, background: scoreRingColor(stats.avgScore) }}
                    />
                  </div>
                </div>
              </div>

              {/* Rank */}
              <div className="flex flex-col justify-between rounded-2xl border border-border bg-card p-5">
                <p className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground">
                  Global Rank
                </p>
                <div>
                  <p className="font-mono text-3xl font-black text-foreground">
                    #{stats.rank}
                  </p>
                  <p className="font-mono text-[10px] text-muted-foreground">
                    of {stats.totalRankedDevelopers} devs
                  </p>
                </div>
              </div>

              {/* Assessments */}
              <div className="flex flex-col justify-between rounded-2xl border border-border bg-card p-5">
                <p className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground">
                  Assessments
                </p>
                <div>
                  <p className="font-mono text-3xl font-black text-foreground">
                    {stats.assessmentCount}
                  </p>
                  <p className="font-mono text-[10px] text-muted-foreground">
                    top score: {stats.topScore}
                  </p>
                </div>
              </div>
            </div>

            {/* Progress chart */}
            <div className="rounded-2xl border border-border bg-card p-6">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <h2 className="font-mono text-sm font-bold">Score Progress</h2>
                  <p className="font-mono text-[10px] text-muted-foreground">
                    Average score over time
                  </p>
                </div>
                <div className="flex gap-1 rounded-lg border border-border p-1">
                  {(['daily', 'weekly', 'monthly'] as Range[]).map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setRange(r)}
                      className={`rounded px-3 py-1.5 font-mono text-[10px] font-bold uppercase transition-colors ${
                        range === r
                          ? 'bg-primary/15 text-primary'
                          : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      {r === 'daily' ? '30d' : r === 'weekly' ? '12w' : '12m'}
                    </button>
                  ))}
                </div>
              </div>
              <div className="h-40">
                <LineChart points={historyPoints} />
              </div>
            </div>

            {/* Share CTA */}
            <div className="mt-6 flex items-center justify-between rounded-2xl border border-primary/20 bg-primary/5 px-6 py-4">
              <div>
                <p className="font-mono text-sm font-bold text-foreground">Share your developer profile</p>
                <p className="font-mono text-[10px] text-muted-foreground">
                  Let companies discover your assessment scores
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(`${window.location.origin}/company/talent/${stats.userId}`);
                }}
                className="flex items-center gap-2 rounded-lg bg-primary/15 px-4 py-2 font-mono text-xs font-bold text-primary transition-colors hover:bg-primary/25"
              >
                <Icon icon="solar:share-linear" />
                Copy Profile Link
              </button>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <Icon icon="solar:chart-linear" className="mb-4 text-5xl text-muted-foreground/30" />
            <p className="font-mono text-sm text-muted-foreground">
              Run your first assessment to see stats
            </p>
            {data.statsError && (
              <p className="mt-2 font-mono text-xs text-red-400">Error: {data.statsError}</p>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
