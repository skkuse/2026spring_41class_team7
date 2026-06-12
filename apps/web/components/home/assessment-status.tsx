import Link from 'next/link';
import { Icon } from '@iconify/react';

import type { AssessmentSummary } from './responsive-home';

function ScoreBadge({ score }: { score: number }) {
  const color =
    score >= 70 ? 'text-green-400 border-green-400/30 bg-green-400/5' :
    score >= 40 ? 'text-yellow-400 border-yellow-400/30 bg-yellow-400/5' :
                  'text-primary border-primary/30 bg-primary/5';
  return (
    <span className={`inline-flex items-center gap-1 rounded border px-2 py-0.5 font-mono text-xs font-bold ${color}`}>
      {score}/100
    </span>
  );
}

export function AssessmentCard({ item }: { item: AssessmentSummary }) {
  const date = new Date(item.createdAt).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  });

  return (
    <Link href={`/projects/${item.id}`} className="block">
      <article className="group relative overflow-hidden rounded-lg border border-border bg-card/40 p-5 transition-colors hover:border-primary/40 hover:bg-card/60">
        <div className="absolute bottom-0 left-0 top-0 w-[2px] bg-primary opacity-0 transition-opacity group-hover:opacity-100" />
        <div className="mb-3 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="mb-0.5 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              {item.assessmentType}
            </p>
            <h3 className="truncate font-mono text-sm font-bold">
              {item.repoOwner}/{item.repoName}
            </h3>
          </div>
          <ScoreBadge score={item.overallScore} />
        </div>
        <div className="mb-4 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Icon icon="solar:calendar-linear" className="text-sm" />
            {date}
          </span>
          <span className="flex items-center gap-1">
            <Icon icon="solar:cpu-bolt-linear" className="text-sm" />
            {item.model}
          </span>
        </div>
        <span className="inline-flex items-center gap-1.5 font-mono text-[10px] font-bold uppercase tracking-widest text-primary transition-opacity group-hover:opacity-70">
          <Icon icon="solar:arrow-right-linear" />
          View Details
        </span>
      </article>
    </Link>
  );
}

const INSTALL_STEPS = [
  {
    step: '01',
    title: 'Install the CLI',
    code: 'npm install -g jobclaw',
    icon: 'solar:download-minimalistic-linear',
  },
  {
    step: '02',
    title: 'Assess your repo',
    code: 'cd your-project && jobclaw assess',
    icon: 'solar:code-scan-linear',
  },
  {
    step: '03',
    title: 'Publish your assessment',
    code: 'jobclaw publish',
    icon: 'solar:cloud-upload-linear',
  },
];

export function GettingStarted() {
  return (
    <div className="space-y-4">
      <div className="mb-6">
        <p className="mb-1 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
          No projects yet
        </p>
        <h2 className="font-heading text-2xl font-bold tracking-tight">
          Get started with Jobclaw
        </h2>
      </div>
      {INSTALL_STEPS.map(({ step, title, code, icon }) => (
        <div
          key={step}
          className="relative overflow-hidden rounded-lg border border-border bg-card/40 p-5"
        >
          <div className="absolute bottom-0 left-0 top-0 w-[2px] bg-primary" />
          <div className="mb-2 flex items-center gap-2">
            <Icon icon={icon} className="text-base text-primary" />
            <span className="font-mono text-[10px] text-muted-foreground">{step} /</span>
            <span className="font-mono text-xs font-bold uppercase tracking-wide">{title}</span>
          </div>
          <code className="block rounded bg-background/80 px-3 py-2 font-mono text-xs text-foreground">
            {code}
          </code>
        </div>
      ))}
      <p className="pt-2 font-mono text-[10px] leading-relaxed text-muted-foreground">
        Your published assessments will appear here once you run <span className="text-foreground">jobclaw publish</span>.
      </p>
    </div>
  );
}

export function AssessmentList({
  assessments,
  loading,
  className = '',
}: {
  assessments: AssessmentSummary[];
  loading: boolean;
  className?: string;
}) {
  if (loading) {
    return (
      <p className={`font-mono text-xs text-muted-foreground ${className}`}>
        Loading projects…
      </p>
    );
  }

  if (assessments.length === 0) {
    return <GettingStarted />;
  }

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="mb-4 flex items-center gap-2">
        <Icon icon="hugeicons:cpu" className="text-xl text-primary" />
        <h3 className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
          Your Projects · {assessments.length}
        </h3>
      </div>
      {assessments.map((a) => (
        <AssessmentCard key={a.id} item={a} />
      ))}
      <Link
        href="/builder"
        className="mt-6 flex w-full items-center justify-between rounded-lg border border-primary/30 bg-primary/5 px-5 py-4 transition-colors hover:bg-primary/10"
      >
        <div className="flex items-center gap-3">
          <Icon icon="hugeicons:magic-wand-01" className="text-lg text-primary" />
          <div>
            <p className="font-mono text-xs font-bold text-foreground">Build Portfolio</p>
            <p className="font-mono text-[9px] text-muted-foreground">Turn your project reports into a portfolio</p>
          </div>
        </div>
        <Icon icon="solar:arrow-right-linear" className="text-primary" />
      </Link>
    </div>
  );
}
