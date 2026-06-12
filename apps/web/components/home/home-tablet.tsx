import Image from 'next/image';

import { AssessmentList } from './assessment-status';
import { InstallCLIButton } from './cli-install-modal';
import { DashboardBottomNav } from './dashboard-bottom-nav';
import type { AssessmentSummary } from './responsive-home';

type Props = { assessments: AssessmentSummary[]; loading: boolean };

export function HomeTablet({ assessments, loading }: Props) {
  return (
    <div className="min-h-screen bg-background pb-nav-safe font-sans text-foreground">
      <header className="border-b border-border/50 px-8 pb-6 pt-12">
        <div className="mx-auto flex max-w-3xl items-center justify-between">
          <div className="flex items-center gap-3">
            <Image src="/logo.png" alt="Jobclaw" width={140} height={32} className="h-8 w-auto" />
          </div>
          <InstallCLIButton className="rounded border border-border/50 bg-secondary px-4 py-2 font-mono text-[10px] font-bold uppercase tracking-widest text-secondary-foreground transition-colors hover:bg-muted" />
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-8 py-10">
        <AssessmentList assessments={assessments} loading={loading} />
      </main>
      <DashboardBottomNav tone="tablet" />
    </div>
  );
}
