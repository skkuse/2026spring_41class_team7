import Image from 'next/image';

import { AssessmentList } from './assessment-status';
import { CLIOnboardingSection } from './cli-install-modal';
import { DashboardBottomNav } from './dashboard-bottom-nav';
import type { AssessmentSummary } from './responsive-home';

type Props = { assessments: AssessmentSummary[]; loading: boolean };

export function HomeMobile({ assessments, loading }: Props) {
  return (
    <div className="min-h-screen bg-background pb-nav-safe font-sans text-foreground">
      <header className="border-b border-border/50 px-6 pb-5 pt-10">
        <Image src="/logo.png" alt="Jobclaw" width={140} height={32} className="h-8 w-auto" />
      </header>
      <main className="px-6 py-8 space-y-6">
        <AssessmentList assessments={assessments} loading={loading} />
        <CLIOnboardingSection />
      </main>
      <DashboardBottomNav tone="mobile" />
    </div>
  );
}
