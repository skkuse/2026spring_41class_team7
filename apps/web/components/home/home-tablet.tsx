import { Icon } from '@iconify/react';

import { AssessmentList } from './assessment-status';
import { DashboardBottomNav } from './dashboard-bottom-nav';
import type { AssessmentSummary } from './responsive-home';

type Props = { assessments: AssessmentSummary[]; loading: boolean };

export function HomeTablet({ assessments, loading }: Props) {
  return (
    <div className="min-h-screen bg-background pb-nav-safe font-sans text-foreground">
      <header className="border-b border-border/50 px-8 pb-6 pt-12">
        <div className="mx-auto flex max-w-3xl items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Icon icon="solar:bolt-bold" className="text-xl" />
            </div>
            <span className="font-heading text-2xl font-black tracking-tighter">
              Job<span className="text-primary">claw</span>
            </span>
          </div>
          <a
            href="https://www.npmjs.com/package/jobclaw"
            target="_blank"
            rel="noreferrer"
            className="rounded border border-border/50 bg-secondary px-4 py-2 font-mono text-[10px] font-bold uppercase tracking-widest text-secondary-foreground transition-colors hover:bg-muted"
          >
            Install CLI
          </a>
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-8 py-10">
        <AssessmentList assessments={assessments} loading={loading} />
      </main>
      <DashboardBottomNav tone="tablet" />
    </div>
  );
}
