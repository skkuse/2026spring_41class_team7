'use client';

import { useEffect, useState } from 'react';

import { useApi } from '../../lib/api-context';
import { useHomeBreakpoint } from '../../hooks/use-breakpoint';
import { DashboardBottomNav } from './dashboard-bottom-nav';
import { HomeDesktop } from './home-desktop';
import { HomeMobile } from './home-mobile';
import { HomeTablet } from './home-tablet';
import type { DeveloperStats } from './score-card';

export type AssessmentSummary = {
  id: string;
  repoUrl: string;
  repoOwner: string;
  repoName: string;
  assessmentType: string;
  overallScore: number;
  model: string;
  generatedAt: string;
  createdAt: string;
};

export function ResponsiveHome() {
  const bp = useHomeBreakpoint();
  const { get, authToken } = useApi();
  const [assessments, setEvaluations] = useState<AssessmentSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DeveloperStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);

  useEffect(() => {
    if (!authToken) {
      setLoading(false);
      return;
    }
    setLoading(true);
    get<{ items: AssessmentSummary[]; total: number }>('/v1/assessments')
      .then((data) => setEvaluations(data.items))
      .catch(() => setEvaluations([]))
      .finally(() => setLoading(false));
  }, [get, authToken]);

  useEffect(() => {
    if (!authToken) {
      setStatsLoading(false);
      return;
    }
    setStatsLoading(true);
    get<DeveloperStats>('/v1/profile/stats')
      .then((data) => setStats(data))
      .catch(() => setStats(null))
      .finally(() => setStatsLoading(false));
  }, [get, authToken]);

  const nav =
    bp === 'mobile' || bp === 'tablet' ? (
      <DashboardBottomNav tone={bp === 'tablet' ? 'tablet' : 'mobile'} />
    ) : null;

  if (bp === 'desktop') {
    return <HomeDesktop assessments={assessments} loading={loading} stats={stats} statsLoading={statsLoading} />;
  }
  if (bp === 'tablet') {
    return (
      <>
        <HomeTablet assessments={assessments} loading={loading} stats={stats} statsLoading={statsLoading} />
        {nav}
      </>
    );
  }
  return (
    <>
      <HomeMobile assessments={assessments} loading={loading} stats={stats} statsLoading={statsLoading} />
      {nav}
    </>
  );
}
