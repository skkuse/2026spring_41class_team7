import { Icon } from '@iconify/react';

import { AssessmentList } from './assessment-status';
import { InstallCLIButton } from './cli-install-modal';
import type { AssessmentSummary } from './responsive-home';

type Props = { assessments: AssessmentSummary[]; loading: boolean };

export function HomeDesktop({ assessments, loading }: Props) {
  return (
    <div className="min-h-screen bg-background font-home-sans text-foreground">
      <main className="mx-auto max-w-5xl px-8 py-12 lg:py-16">
        <div className="mb-10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Icon icon="solar:bolt-bold" className="text-xl" />
            </div>
            <span className="font-home-heading text-2xl font-black tracking-tighter">
              Job<span className="text-primary">claw</span>
            </span>
          </div>
          <InstallCLIButton className="rounded-lg border border-border/50 bg-secondary px-5 py-3 font-home-mono text-xs font-bold uppercase tracking-widest text-secondary-foreground transition-colors hover:bg-muted" />
        </div>
        <AssessmentList assessments={assessments} loading={loading} />
      </main>
    </div>
  );
}
