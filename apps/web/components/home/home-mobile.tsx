import Image from 'next/image';

import { AssessmentList } from './assessment-status';
import { InstallCLIButton } from './cli-install-modal';
import { DashboardBottomNav } from './dashboard-bottom-nav';
import type { AssessmentSummary } from './responsive-home';

type Props = { assessments: AssessmentSummary[]; loading: boolean };

export function HomeMobile({ assessments, loading }: Props) {
  return (
    <div className="min-h-screen bg-background pb-nav-safe font-sans text-foreground">
      <header className="border-b border-border/50 px-6 pb-5 pt-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Image src="/logo.png" alt="Jobclaw" width={140} height={32} className="h-8 w-auto" />
          </div>
          <InstallCLIButton className="rounded border border-border/50 px-3 py-1.5 font-mono text-[10px] font-bold uppercase tracking-widest text-muted-foreground transition-colors hover:text-foreground" />
        </div>
      </header>
      <main className="px-6 py-8">
        <AssessmentList assessments={assessments} loading={loading} />
      </main>
      <DashboardBottomNav tone="mobile" />
    </div>
  );
}
