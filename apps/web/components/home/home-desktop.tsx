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
          <div>
            <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-primary">
              <Icon icon="hugeicons:ai-brain-01" className="text-sm" />
              <span className="font-home-mono text-[10px] font-bold uppercase tracking-widest">
                AI-Engine Active
              </span>
            </div>
            <h2 className="font-home-heading text-3xl font-extrabold tracking-tight">
              Dashboard
            </h2>
          </div>
          <InstallCLIButton className="rounded-lg border border-border/50 bg-secondary px-5 py-3 font-home-mono text-xs font-bold uppercase tracking-widest text-secondary-foreground transition-colors hover:bg-muted" />
        </div>
        <AssessmentList assessments={assessments} loading={loading} />
      </main>
    </div>
  );
}
