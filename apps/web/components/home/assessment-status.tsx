import Link from 'next/link';
import { Icon } from '@iconify/react';

import type { EvaluationSummary } from './responsive-home';

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

export function AssessmentCard({ item }: { item: EvaluationSummary }) {
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
              {item.evaluationType}
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


export function GettingStarted() {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <Icon icon="solar:folder-open-linear" className="mb-4 text-4xl text-muted-foreground/40" />
      <p className="mb-1 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
        No projects yet
      </p>
      <p className="font-mono text-xs text-muted-foreground/60">
        Follow the Quick Start guide to run your first assessment.
      </p>
    </div>
  );
}

export function AssessmentList({
  evaluations,
  loading,
  className = '',
}: {
  evaluations: EvaluationSummary[];
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

  if (evaluations.length === 0) {
    return <GettingStarted />;
  }

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="mb-4 flex items-center gap-2">
        <Icon icon="hugeicons:cpu" className="text-xl text-primary" />
        <h3 className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
          Your Projects · {evaluations.length}
        </h3>
      </div>
      {evaluations.map((a) => (
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
