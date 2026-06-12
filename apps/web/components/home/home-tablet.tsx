import Image from 'next/image';

import { AssessmentList } from './evaluation-status';
import { CLIOnboardingSection } from './cli-install-modal';
import { DashboardBottomNav } from './dashboard-bottom-nav';
import { ScoreCard } from './score-card';
import type { AssessmentSummary } from './responsive-home';
import type { DeveloperStats } from './score-card';

type Props = {
  assessments: AssessmentSummary[];
  loading: boolean;
  stats: DeveloperStats | null;
  statsLoading: boolean;
};

export function HomeTablet({ assessments, loading, stats, statsLoading }: Props) {
  return (
    <div className="min-h-screen bg-background pb-nav-safe font-sans text-foreground">
      <header className="border-b border-border/50 px-8 pb-6 pt-12">
        <div className="mx-auto max-w-3xl">
          <Image src="/logo.png" alt="Jobclaw" width={140} height={32} className="h-8 w-auto" />
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-8 py-10 space-y-8">
        {statsLoading ? (
          <div className="h-36 animate-pulse rounded-2xl border border-border bg-card/40" />
        ) : stats ? (
          <ScoreCard stats={stats} compact />
        ) : null}
        <AssessmentList assessments={assessments} loading={loading} />
        <CLIOnboardingSection />
      </main>
      <DashboardBottomNav tone="tablet" />
    </div>
  );
}
