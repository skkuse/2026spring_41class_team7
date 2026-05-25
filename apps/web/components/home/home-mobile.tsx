import { Icon } from '@iconify/react';

import { AssessmentList } from './assessment-status';
import { DashboardBottomNav } from './dashboard-bottom-nav';
import type { AssessmentSummary } from './responsive-home';

type Props = { assessments: AssessmentSummary[]; loading: boolean };

export function HomeMobile({ assessments, loading }: Props) {
  return (
    <div className="min-h-screen bg-background pb-nav-safe font-sans text-foreground">
      <header className="border-b border-border/50 px-6 pb-5 pt-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded bg-primary text-primary-foreground">
              <Icon icon="solar:bolt-bold" className="text-lg" />
            </div>
            <span className="font-heading text-xl font-black tracking-tighter">
              Job<span className="text-primary">claw</span>
            </span>
          </div>
          <a
            href="https://www.npmjs.com/package/jobclaw"
            target="_blank"
            rel="noreferrer"
            className="rounded border border-border/50 px-3 py-1.5 font-mono text-[10px] font-bold uppercase tracking-widest text-muted-foreground transition-colors hover:text-foreground"
          >
            Install CLI
          </a>
        </div>
      </header>
      <main className="px-6 py-8">
        <AssessmentList assessments={assessments} loading={loading} />
      </main>
      <DashboardBottomNav tone="mobile" />
    </div>
  );
}
