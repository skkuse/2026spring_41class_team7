'use client';

import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Icon } from '@iconify/react';

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const copy = useCallback(() => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }, [text]);
  return (
    <button
      type="button"
      onClick={copy}
      title={copied ? 'Copied!' : 'Copy prompt'}
      className="ml-auto flex-shrink-0 rounded p-1 text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary"
    >
      <Icon
        icon={copied ? 'solar:check-linear' : 'solar:copy-linear'}
        className="text-sm"
      />
    </button>
  );
}

import { useApi } from '../../../lib/api-context';

type ScorecardRow = {
  criterion: string;
  score: number;
  status: 'Strong' | 'Partial' | 'Missing';
  confidence: 'High' | 'Medium' | 'Low';
  rationale: string;
};

type Assessment = {
  id: string;
  repoUrl: string;
  repoOwner: string;
  repoName: string;
  assessmentType: string;
  overallScore: number;
  scores: Record<string, number>;
  scorecard: ScorecardRow[];
  findings: string[];
  gapsAndRisks: string[];
  nextSteps: string[];
  executiveSummary: string;
  model: string;
  contextChars: number;
  generatedAt: string;
  createdAt: string;
};

function ScoreBar({ label, value }: { label: string; value: number }) {
  const pct = Math.round((value / 10) * 100);
  const color = value >= 7 ? 'bg-green-400' : value >= 4 ? 'bg-yellow-400' : 'bg-primary';
  return (
    <div>
      <div className="mb-1 flex justify-between font-mono text-xs">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-bold">{value}/10</span>
      </div>
      <div className="h-1.5 w-full rounded-full bg-border">
        <div className={`h-1.5 rounded-full ${color} transition-all`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

const STATUS_COLOR: Record<ScorecardRow['status'], string> = {
  Strong: 'text-green-400 border-green-400/30 bg-green-400/5',
  Partial: 'text-yellow-400 border-yellow-400/30 bg-yellow-400/5',
  Missing: 'text-primary border-primary/30 bg-primary/5',
};

export default function ProjectPage() {
  const { id } = useParams<{ id: string }>();
  const { get, authToken } = useApi();
  const [data, setData] = useState<Assessment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authToken || !id) return;
    setLoading(true);
    get<Assessment>(`/v1/assessments/${id}`)
      .then(setData)
      .catch((e: unknown) => setError(e instanceof Error ? e.message : 'Failed to load'))
      .finally(() => setLoading(false));
  }, [get, authToken, id]);

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background">
        <p className="font-mono text-xs text-muted-foreground">Loading assessment…</p>
      </main>
    );
  }

  if (error || !data) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background">
        <p className="font-mono text-xs text-primary">{error ?? 'Assessment not found.'}</p>
        <Link href="/home" className="font-mono text-xs text-muted-foreground hover:text-foreground">
          ← Back to dashboard
        </Link>
      </main>
    );
  }

  const date = new Date(data.createdAt).toLocaleDateString('en-US', {
    month: 'long', day: 'numeric', year: 'numeric',
  });

  const overallColor =
    data.overallScore >= 70 ? 'text-green-400' :
    data.overallScore >= 40 ? 'text-yellow-400' : 'text-primary';

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-3xl px-6 py-10">
        {/* Back */}
        <Link
          href="/home"
          className="mb-8 inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-widest text-muted-foreground transition-colors hover:text-foreground"
        >
          <Icon icon="solar:arrow-left-linear" />
          Dashboard
        </Link>

        {/* Header */}
        <div className="mb-10">
          <p className="mb-1 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            {data.assessmentType} · {date}
          </p>
          <h1 className="mb-3 font-mono text-2xl font-bold">
            {data.repoOwner}/{data.repoName}
          </h1>
          <div className="flex flex-wrap items-center gap-4">
            <span className={`font-mono text-5xl font-black ${overallColor}`}>
              {data.overallScore}
              <span className="text-xl text-muted-foreground">/100</span>
            </span>
            <div className="text-xs text-muted-foreground space-y-0.5">
              <p>Model: <span className="text-foreground">{data.model}</span></p>
              <p>Context: <span className="text-foreground">{(data.contextChars / 1000).toFixed(0)}k chars</span></p>
            </div>
            <a
              href={data.repoUrl}
              target="_blank"
              rel="noreferrer"
              className="ml-auto inline-flex items-center gap-1.5 rounded border border-border px-3 py-1.5 font-mono text-[10px] font-bold uppercase tracking-widest text-muted-foreground transition-colors hover:text-foreground"
            >
              <Icon icon="solar:arrow-right-up-linear" />
              View Repo
            </a>
          </div>
        </div>

        {/* Executive Summary */}
        <section className="mb-8 rounded-lg border border-border bg-card/40 p-6">
          <h2 className="mb-3 font-mono text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
            Executive Summary
          </h2>
          <p className="text-sm leading-relaxed text-foreground">{data.executiveSummary}</p>
        </section>

        {/* Score Breakdown */}
        {Object.keys(data.scores).length > 0 && (
          <section className="mb-8 rounded-lg border border-border bg-card/40 p-6">
            <h2 className="mb-5 font-mono text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              Score Breakdown
            </h2>
            <div className="space-y-4">
              {Object.entries(data.scores).map(([k, v]) => (
                <ScoreBar key={k} label={k} value={v} />
              ))}
            </div>
          </section>
        )}

        {/* Scorecard */}
        {data.scorecard.length > 0 && (
          <section className="mb-8 rounded-lg border border-border bg-card/40 p-6">
            <h2 className="mb-4 font-mono text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              Scorecard
            </h2>
            <div className="space-y-3">
              {data.scorecard.map((row, i) => (
                <div key={i} className="rounded border border-border bg-background/60 p-4">
                  <div className="mb-2 flex flex-wrap items-center gap-2">
                    <span className="font-mono text-sm font-bold">{row.criterion}</span>
                    <span className={`rounded border px-1.5 py-0.5 font-mono text-[10px] font-bold ${STATUS_COLOR[row.status]}`}>
                      {row.status}
                    </span>
                    <span className="ml-auto font-mono text-sm font-bold">{row.score}/10</span>
                  </div>
                  <p className="text-xs leading-relaxed text-muted-foreground">{row.rationale}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Findings */}
        {data.findings.length > 0 && (
          <section className="mb-8 rounded-lg border border-border bg-card/40 p-6">
            <h2 className="mb-4 font-mono text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              Findings
            </h2>
            <ul className="space-y-2">
              {data.findings.map((f, i) => (
                <li key={i} className="flex gap-2 text-sm leading-relaxed">
                  <Icon icon="solar:check-circle-linear" className="mt-0.5 flex-shrink-0 text-base text-green-400" />
                  {f}
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Gaps & Risks */}
        {data.gapsAndRisks.length > 0 && (
          <section className="mb-8 rounded-lg border border-border bg-card/40 p-6">
            <h2 className="mb-4 font-mono text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              Gaps &amp; Risks
            </h2>
            <ul className="space-y-2">
              {data.gapsAndRisks.map((g, i) => (
                <li key={i} className="flex gap-2 text-sm leading-relaxed">
                  <Icon icon="solar:danger-triangle-linear" className="mt-0.5 flex-shrink-0 text-base text-yellow-400" />
                  {g}
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Next Steps */}
        {data.nextSteps.length > 0 && (
          <section className="rounded-lg border border-primary/20 bg-primary/5 p-6">
            <div className="mb-4 flex items-start justify-between gap-3">
              <h2 className="font-mono text-[10px] font-bold uppercase tracking-widest text-primary">
                Next Steps
              </h2>
              <div className="group relative flex-shrink-0">
                <div className="flex cursor-help items-center gap-1 rounded-full border border-primary/20 bg-primary/10 px-2 py-0.5 font-mono text-[9px] font-bold uppercase tracking-wide text-primary">
                  <Icon icon="solar:cpu-bolt-linear" className="text-xs" />
                  AI Coding Agent Prompts
                  <Icon icon="solar:info-circle-linear" className="text-xs" />
                </div>
                <div className="pointer-events-none absolute right-0 top-full z-20 mt-2 w-64 rounded-lg border border-border bg-card p-3 text-xs leading-relaxed text-muted-foreground opacity-0 shadow-lg transition-opacity group-hover:opacity-100">
                  These prompts are ready to paste into AI coding agents like Cursor, GitHub Copilot, or Claude Code to implement the recommended improvements directly in your codebase.
                </div>
              </div>
            </div>
            <ol className="space-y-3">
              {data.nextSteps.map((s, i) => (
                <li key={i} className="flex items-start gap-3 rounded-lg border border-primary/10 bg-background/40 px-4 py-3 text-sm leading-relaxed">
                  <span className="flex-shrink-0 font-mono text-[10px] font-bold text-primary">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <span className="flex-1">{s}</span>
                  <CopyButton text={s} />
                </li>
              ))}
            </ol>
          </section>
        )}
      </div>
    </main>
  );
}
