import Image from 'next/image';

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
            <Image src="/logo.png" alt="Jobclaw" width={140} height={32} className="h-8 w-auto" />
          </div>
          <InstallCLIButton className="rounded-lg border border-border/50 bg-secondary px-5 py-3 font-home-mono text-xs font-bold uppercase tracking-widest text-secondary-foreground transition-colors hover:bg-muted" />
        </div>
        <AssessmentList assessments={assessments} loading={loading} />
      </main>
    </div>
  );
}
