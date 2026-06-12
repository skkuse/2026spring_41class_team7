'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import { useHomeBreakpoint } from '../../hooks/use-breakpoint';
import { useApi } from '../../lib/api-context';
import { DashboardBottomNav } from '../home/dashboard-bottom-nav';
import { BuilderDesktop } from './builder-desktop';
import { BuilderMobile } from './builder-mobile';
import { BuilderTablet } from './builder-tablet';
import { SaveSuccessOverlay } from './save-success-overlay';
import type {
  AssessmentDetail,
  AssessmentSummary,
  BuilderPhase,
  PortfolioSection,
  PortfolioSectionData,
} from './builder-types';

export function ResponsiveBuilder({ loadDocId }: { loadDocId?: string }) {
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
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

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

  // If loadDocId is provided, fetch the saved document and jump to editing phase
  useEffect(() => {
    if (!loadDocId || !authToken) return;
    get<{ name: string; sections: PortfolioSectionData[] }>(`/v1/documents/${loadDocId}`)
      .then((doc) => {
        const loaded: PortfolioSection[] = doc.sections.map((s) => ({
          id: s.assessmentId,
          data: s,
          generating: false,
        }));
        setOrderedIds(doc.sections.map((s) => s.assessmentId));
        setSections(loaded);
        setPhase('editing');
      })
      .catch(() => { /* fall through to normal select phase */ });
  }, [loadDocId, authToken, get]);

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
    setGenerationError(null);

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
    } catch (err) {
      setGenerationError(err instanceof Error ? err.message : 'Portfolio generation failed.');
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

  const onSave = useCallback(async () => {
    const items = sections.filter((s) => s.data && !s.generating).map((s) => s.data!);
    if (items.length === 0) return;
    setIsSaving(true);
    setSaveSuccess(false);
    setSaveError(null);
    try {
      await post('/v1/portfolio/save', { sections: items });
      setSaveSuccess(true);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Failed to save. Please try again.');
      setTimeout(() => setSaveError(null), 5000);
    } finally {
      setIsSaving(false);
    }
  }, [sections, post]);

  const onExport = useCallback(() => {
    const items = sections.filter((s) => s.data).map((s) => s.data!);
    if (items.length === 0) return;

    const e = (s: unknown) =>
      String(s ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');

    const sectionsHtml = items
      .map(
        (d) => `
      <div class="section">
        <div class="repo">${e(d.repoOwner)}/${e(d.repoName)}</div>
        <div class="headline">${e(d.headline)}</div>
        <div class="meta">
          <span>${e(d.role)}</span>
          <span>${e(d.duration)}</span>
          <span>Score: ${Number(d.overallScore)}/100</span>
        </div>
        <p class="summary">${e(d.summary)}</p>
        <div class="tech"><strong>Tech Stack:</strong> ${d.techStack.map(e).join(', ')}</div>
        <div class="highlights-label">Highlights</div>
        <ul>${d.highlights.map((h) => `<li><strong>${e(h.title)}:</strong> ${e(h.description)}</li>`).join('')}</ul>
        <div class="impact">${e(d.impact)}</div>
      </div>`,
      )
      .join('');

    const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Software Portfolio</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: Georgia, 'Times New Roman', serif; max-width: 780px; margin: 0 auto; padding: 48px 40px; color: #1a1a1a; font-size: 14px; line-height: 1.6; }
    h1 { font-size: 2rem; font-weight: 700; margin-bottom: 4px; letter-spacing: -0.02em; }
    .subtitle { color: #666; margin-bottom: 40px; font-size: 0.9rem; }
    .section { margin-bottom: 36px; padding-top: 28px; border-top: 1.5px solid #e2e2e2; page-break-inside: avoid; }
    .repo { font-family: 'Courier New', monospace; font-size: 0.75rem; color: #888; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 4px; }
    .headline { font-size: 1.15rem; font-weight: 700; margin-bottom: 8px; }
    .meta { display: flex; gap: 16px; font-size: 0.8rem; color: #555; margin-bottom: 12px; }
    .meta span::before { content: '·'; margin-right: 4px; color: #ccc; }
    .meta span:first-child::before { content: ''; margin-right: 0; }
    .summary { margin-bottom: 12px; color: #333; }
    .tech { font-size: 0.82rem; color: #555; margin-bottom: 14px; }
    .highlights-label { font-size: 0.72rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.12em; color: #999; margin-bottom: 6px; }
    ul { padding-left: 18px; margin-bottom: 14px; }
    li { margin-bottom: 5px; color: #333; }
    .impact { font-style: italic; color: #444; padding-left: 14px; border-left: 3px solid #c96442; }
    @media print {
      body { padding: 20px; }
      .section { page-break-inside: avoid; }
    }
  </style>
</head>
<body>
  <h1>Software Portfolio</h1>
  <div class="subtitle">Generated by Jobclaw</div>
  ${sectionsHtml}
</body>
</html>`;

    const w = window.open('', '_blank');
    if (!w) return;
    w.document.write(html);
    w.document.close();
    w.focus();
    setTimeout(() => w.print(), 400);
  }, [sections]);

  const onReset = useCallback(() => {
    setPhase('select');
    setOrderedIds([]);
    setCarouselIdx(0);
    setSections([]);
    setGenerationError(null);
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
    generationError,
    isSaving,
    saveSuccess,
    saveError,
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

  const savedCount = sections.filter((s) => s.data && !s.generating).length;

  return (
    <>
      {bp === 'desktop' && <BuilderDesktop {...props} />}
      {bp === 'tablet' && <><BuilderTablet {...props} />{nav}</>}
      {bp !== 'desktop' && bp !== 'tablet' && <><BuilderMobile {...props} />{nav}</>}
      {saveSuccess && (
        <SaveSuccessOverlay
          count={savedCount}
          onDismiss={() => setSaveSuccess(false)}
        />
      )}
    </>
  );
}
