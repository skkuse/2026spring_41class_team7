import Image from 'next/image';

import { AssessmentList } from './evaluation-status';
import { CLIOnboardingSection } from './cli-install-modal';
import { ScoreCard } from './score-card';
import type { AssessmentSummary } from './responsive-home';
import type { DeveloperStats } from './score-card';

type Props = {
  assessments: AssessmentSummary[];
  loading: boolean;
  stats: DeveloperStats | null;
  statsLoading: boolean;
};

export function HomeDesktop({ assessments, loading, stats, statsLoading }: Props) {
  return (
    <div className="min-h-screen bg-background font-home-sans text-foreground">
      <main className="mx-auto max-w-5xl px-8 py-12 lg:py-16">
        <div className="mb-10">
          <Image src="/logo.png" alt="Jobclaw" width={140} height={32} className="h-8 w-auto" />
        </div>
        <div className="flex gap-10">
          <div className="min-w-0 flex-1">
            <AssessmentList assessments={assessments} loading={loading} />
          </div>
          <aside className="w-72 flex-shrink-0 space-y-4">
            {statsLoading ? (
              <div className="h-36 animate-pulse rounded-2xl border border-border bg-card/40" />
            ) : stats ? (
              <ScoreCard stats={stats} compact />
            ) : null}
            <CLIOnboardingSection />
          </aside>
        </div>
      </main>
    </div>
  );
}
