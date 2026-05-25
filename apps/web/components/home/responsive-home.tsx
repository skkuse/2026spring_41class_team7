'use client';

import { useEffect, useState } from 'react';

import { useApi } from '../../lib/api-context';
import { useHomeBreakpoint } from '../../hooks/use-breakpoint';
import { DashboardBottomNav } from './dashboard-bottom-nav';
import { HomeDesktop } from './home-desktop';
import { HomeMobile } from './home-mobile';
import { HomeTablet } from './home-tablet';

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
  const [assessments, setAssessments] = useState<AssessmentSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authToken) {
      setLoading(false);
      return;
    }
    setLoading(true);
    get<{ items: AssessmentSummary[]; total: number }>('/v1/assessments')
      .then((data) => setAssessments(data.items))
      .catch(() => setAssessments([]))
      .finally(() => setLoading(false));
  }, [get, authToken]);

  const nav =
    bp === 'mobile' || bp === 'tablet' ? (
      <DashboardBottomNav tone={bp === 'tablet' ? 'tablet' : 'mobile'} />
    ) : null;

  if (bp === 'desktop') {
    return <HomeDesktop assessments={assessments} loading={loading} />;
  }
  if (bp === 'tablet') {
    return (
      <>
        <HomeTablet assessments={assessments} loading={loading} />
        {nav}
      </>
    );
  }
  return (
    <>
      <HomeMobile assessments={assessments} loading={loading} />
      {nav}
    </>
  );
}
