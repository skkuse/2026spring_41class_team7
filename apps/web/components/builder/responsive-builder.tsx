'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import { useHomeBreakpoint } from '../../hooks/use-breakpoint';
import { useApi } from '../../lib/api-context';
import { DashboardBottomNav } from '../home/dashboard-bottom-nav';
import { BuilderDesktop } from './builder-desktop';
import { BuilderMobile } from './builder-mobile';
import { BuilderTablet } from './builder-tablet';
import type {
  AssessmentDetail,
  AssessmentSummary,
  BuilderPhase,
  PortfolioSection,
  PortfolioSectionData,
} from './builder-types';

export function ResponsiveBuilder() {
  const bp = useHomeBreakpoint();
  const { get, post, authToken } = useApi();

  const [phase, setPhase] = useState<BuilderPhase>('select');
  const [assessments, setAssessments] = useState<AssessmentSummary[]>([]);
  const [listLoading, setListLoading] = useState(true);
  // orderedIds is the single source of truth — being in this array means checked
  const [orderedIds, setOrderedIds] = useState<string[]>([]);
  const [carouselIdx, setCarouselIdx] = useState(0);
  const [detailCache, setDetailCache] = useState<Record<string, AssessmentDetail>>({});
  const [detailLoading, setDetailLoading] = useState(false);
  const [sections, setSections] = useState<PortfolioSection[]>([]);

  const detailCacheRef = useRef(detailCache);
  detailCacheRef.current = detailCache;

  // Load assessment list
  useEffect(() => {
    if (!authToken) { setListLoading(false); return; }
    setListLoading(true);
    get<{ items: AssessmentSummary[] }>('/v1/assessments')
      .then((d) => setAssessments(d.items))
      .catch(() => setAssessments([]))
      .finally(() => setListLoading(false));
  }, [get, authToken]);

  // Lazy-load detail for whatever the carousel is showing
  useEffect(() => {
    const id = orderedIds[carouselIdx];
    if (!id || detailCache[id] || !authToken) return;
    setDetailLoading(true);
    get<AssessmentDetail>(`/v1/assessments/${id}`)
      .then((d) => setDetailCache((prev) => ({ ...prev, [id]: d })))
      .catch(() => {})
      .finally(() => setDetailLoading(false));
  }, [carouselIdx, orderedIds, detailCache, get, authToken]);

  const onToggle = useCallback((id: string) => {
    setOrderedIds((prev) => {
      if (prev.includes(id)) {
        const next = prev.filter((x) => x !== id);
        setCarouselIdx((idx) => Math.min(idx, Math.max(0, next.length - 1)));
        return next;
      }
      return [...prev, id];
    });
  }, []);

  const onMoveUp = useCallback((id: string) => {
    setOrderedIds((prev) => {
      const idx = prev.indexOf(id);
      if (idx <= 0) return prev;
      const next = [...prev];
      [next[idx - 1], next[idx]] = [next[idx], next[idx - 1]];
      return next;
    });
  }, []);

  const onMoveDown = useCallback((id: string) => {
    setOrderedIds((prev) => {
      const idx = prev.indexOf(id);
      if (idx < 0 || idx >= prev.length - 1) return prev;
      const next = [...prev];
      [next[idx + 1], next[idx]] = [next[idx], next[idx + 1]];
      return next;
    });
  }, []);

  const onBuild = useCallback(async () => {
    if (orderedIds.length === 0) return;
    setPhase('generating');

    // Initialize all sections as generating
    setSections(orderedIds.map((id) => ({ id, data: null, generating: true })));

    try {
      const result = await post<{ sections: PortfolioSectionData[] }>('/v1/portfolio/generate', {
        assessmentIds: orderedIds,
      });
      setSections(
        orderedIds.map((id) => ({
          id,
          data: result.sections.find((s) => s.assessmentId === id) ?? null,
          generating: false,
        })),
      );
    } catch {
      setSections((prev) => prev.map((s) => ({ ...s, generating: false })));
    }

    setPhase('editing');
  }, [orderedIds, post]);

  const onSectionChange = useCallback((id: string, patch: Partial<PortfolioSectionData>) => {
    setSections((prev) =>
      prev.map((s) =>
        s.id === id && s.data ? { ...s, data: { ...s.data, ...patch } } : s,
      ),
    );
  }, []);

  const onSave = useCallback(() => {
    alert('Portfolio saved to Documents.');
  }, []);

  const onExport = useCallback(() => {
    const md = sections
      .filter((s) => s.data)
      .map((s) => {
        const d = s.data!;
        return [
          `## ${d.repoOwner}/${d.repoName}`,
          `**${d.headline}**`,
          '',
          `**Role:** ${d.role}  |  **Duration:** ${d.duration}`,
          '',
          d.summary,
          '',
          `**Tech Stack:** ${d.techStack.join(', ')}`,
          '',
          '### Highlights',
          ...d.highlights.map((h) => `- **${h.title}**: ${h.description}`),
          '',
          `**Impact:** ${d.impact}`,
        ].join('\n');
      })
      .join('\n\n---\n\n');
    const blob = new Blob([md], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'portfolio.md';
    a.click();
    URL.revokeObjectURL(url);
  }, [sections]);

  const onReset = useCallback(() => {
    setPhase('select');
    setOrderedIds([]);
    setCarouselIdx(0);
    setSections([]);
  }, []);

  const currentId = orderedIds[carouselIdx];
  const props = {
    phase,
    assessments,
    listLoading,
    orderedIds,
    carouselIdx,
    setCarouselIdx,
    currentCarouselSummary: currentId ? assessments.find((a) => a.id === currentId) : undefined,
    currentCarouselDetail: currentId ? detailCache[currentId] : undefined,
    detailLoading,
    sections,
    onSectionChange,
    onToggle,
    onMoveUp,
    onMoveDown,
    onBuild,
    onSave,
    onExport,
    onReset,
  };

  const nav =
    bp === 'mobile' || bp === 'tablet' ? (
      <DashboardBottomNav tone={bp === 'tablet' ? 'tablet' : 'mobile'} />
    ) : null;

  if (bp === 'desktop') return <BuilderDesktop {...props} />;
  if (bp === 'tablet')
    return (
      <>
        <BuilderTablet {...props} />
        {nav}
      </>
    );
  return (
    <>
      <BuilderMobile {...props} />
      {nav}
    </>
  );
}
