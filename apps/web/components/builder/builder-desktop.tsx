'use client';

import { Icon } from '@iconify/react';
import { useEffect, useRef } from 'react';

import type { BuilderProps, ScorecardRow } from './builder-types';
import { PortfolioSectionCard } from './portfolio-section-card';

const STATUS_STYLE: Record<ScorecardRow['status'], string> = {
  Strong: 'text-emerald-700 bg-emerald-50 border-emerald-200',
  Partial: 'text-amber-700 bg-amber-50 border-amber-200',
  Missing: 'text-red-700 bg-red-50 border-red-200',
};

function scoreColor(score: number, outOf100 = true) {
  const n = outOf100 ? score : score * 10;
  if (n >= 70) return 'text-emerald-600';
  if (n >= 40) return 'text-amber-600';
  return 'text-red-500';
}

function fmt(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function BuilderDesktop(props: BuilderProps) {
  if (props.phase === 'generating') return <GeneratingView {...props} />;
  if (props.phase === 'editing') return <EditingView {...props} />;
  return <SelectView {...props} />;
}

// ─── SELECT ──────────────────────────────────────────────────────────────────

function SelectView({
  assessments, listLoading, orderedIds, carouselIdx, setCarouselIdx,
  currentCarouselSummary, currentCarouselDetail, detailLoading,
  onToggle, onMoveUp, onMoveDown, onBuild,
}: BuilderProps) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') setCarouselIdx(Math.max(0, carouselIdx - 1));
      if (e.key === 'ArrowRight') setCarouselIdx(Math.min(orderedIds.length - 1, carouselIdx + 1));
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [carouselIdx, orderedIds.length, setCarouselIdx]);

  return (
    <div className="flex h-[calc(100vh-4.25rem)] overflow-hidden bg-background font-sans text-foreground">
      {/* ── Sidebar — scales from w-72 → w-80 → w-96 ── */}
      <aside className="flex w-72 xl:w-80 2xl:w-96 shrink-0 flex-col border-r border-border">
        <div className="border-b border-border px-6 py-6">
          <div className="mb-1 flex items-center gap-2">
            <Icon icon="solar:layers-minimalistic-bold" className="text-lg text-primary" />
            <span className="font-mono text-[9px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
              Select Projects
            </span>
          </div>
          <h1 className="font-heading text-2xl font-bold tracking-tight">Portfolio Builder</h1>
          <p className="mt-1 font-mono text-[9px] text-muted-foreground">Check · reorder · build</p>
        </div>

        <div className="flex-1 overflow-y-auto">
          {listLoading && (
            <p className="px-6 py-8 font-mono text-xs text-muted-foreground">Loading…</p>
          )}
          {!listLoading && assessments.length === 0 && (
            <p className="px-6 py-8 font-mono text-xs text-muted-foreground">
              No assessments. Run <code className="text-primary">jobclaw assess</code>.
            </p>
          )}
          {assessments.map((a) => {
            const pos = orderedIds.indexOf(a.id);
            const isChecked = pos !== -1;
            const isActive = orderedIds[carouselIdx] === a.id;
            return (
              <div
                key={a.id}
                className={`flex items-center gap-3 border-b border-border px-4 py-3 transition-colors ${isActive ? 'bg-primary/5' : 'hover:bg-muted/40'}`}
              >
                <button
                  type="button"
                  onClick={() => onToggle(a.id)}
                  className="shrink-0"
                  aria-label={isChecked ? 'Deselect' : 'Select'}
                >
                  <div className={`flex h-5 w-5 items-center justify-center rounded border-2 transition-colors ${isChecked ? 'border-primary bg-primary' : 'border-border bg-background'}`}>
                    {isChecked && <Icon icon="solar:check-read-linear" className="text-[10px] text-primary-foreground" />}
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => isChecked && setCarouselIdx(pos)}
                  disabled={!isChecked}
                  className="min-w-0 flex-1 text-left disabled:cursor-default"
                >
                  <p className="truncate font-mono text-xs font-bold">
                    {isChecked && <span className="mr-1 text-primary">{pos + 1}.</span>}
                    {a.repoOwner}/{a.repoName}
                  </p>
                  <p className="font-mono text-[9px] text-muted-foreground">
                    {a.assessmentType} · <span className={scoreColor(a.overallScore)}>{a.overallScore}</span>/100
                  </p>
                </button>

                {isChecked && (
                  <div className="flex shrink-0 flex-col">
                    <button type="button" onClick={() => onMoveUp(a.id)} disabled={pos === 0}
                      className="p-0.5 text-muted-foreground hover:text-foreground disabled:opacity-20">
                      <Icon icon="solar:alt-arrow-up-linear" className="text-sm" />
                    </button>
                    <button type="button" onClick={() => onMoveDown(a.id)} disabled={pos === orderedIds.length - 1}
                      className="p-0.5 text-muted-foreground hover:text-foreground disabled:opacity-20">
                      <Icon icon="solar:alt-arrow-down-linear" className="text-sm" />
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="border-t border-border p-4">
          {orderedIds.length > 0 && (
            <p className="mb-3 font-mono text-[9px] text-muted-foreground">
              {orderedIds.length} project{orderedIds.length > 1 ? 's' : ''} selected
            </p>
          )}
          <button
            type="button"
            onClick={onBuild}
            disabled={orderedIds.length === 0}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-3 font-mono text-xs font-black uppercase tracking-[0.12em] text-primary-foreground shadow-[0_0_20px_rgba(201,100,66,0.15)] transition-opacity hover:opacity-90 disabled:opacity-30"
          >
            <Icon icon="solar:magic-stick-3-bold" />
            Build Portfolio
          </button>
        </div>
      </aside>

      {/* ── Carousel — fills remaining width ── */}
      <main className="flex flex-1 flex-col overflow-hidden">
        {orderedIds.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 text-center">
            <Icon icon="solar:gallery-wide-linear" className="text-5xl text-muted-foreground/25" />
            <p className="font-mono text-sm text-muted-foreground">
              Check projects on the left to preview them here.
            </p>
            <p className="font-mono text-[10px] text-muted-foreground/60">
              Use ← → arrow keys to navigate once selected.
            </p>
          </div>
        ) : (
          <>
            {/* Nav bar */}
            <div className="flex shrink-0 items-center justify-between border-b border-border px-10 py-4">
              <button
                type="button"
                onClick={() => setCarouselIdx(Math.max(0, carouselIdx - 1))}
                disabled={carouselIdx === 0}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:text-foreground disabled:opacity-30"
              >
                <Icon icon="solar:arrow-left-linear" />
              </button>

              <div className="text-center">
                <p className="font-heading text-base font-bold">
                  {currentCarouselSummary
                    ? `${currentCarouselSummary.repoOwner}/${currentCarouselSummary.repoName}`
                    : '—'}
                </p>
                <div className="mt-1.5 flex items-center justify-center gap-1.5">
                  {orderedIds.map((_, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setCarouselIdx(i)}
                      className={`h-1.5 rounded-full transition-all ${i === carouselIdx ? 'w-5 bg-primary' : 'w-1.5 bg-border hover:bg-muted-foreground'}`}
                    />
                  ))}
                </div>
                <p className="mt-1 font-mono text-[9px] text-muted-foreground">
                  {carouselIdx + 1} / {orderedIds.length}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setCarouselIdx(Math.min(orderedIds.length - 1, carouselIdx + 1))}
                disabled={carouselIdx === orderedIds.length - 1}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:text-foreground disabled:opacity-30"
              >
                <Icon icon="solar:arrow-right-linear" />
              </button>
            </div>

            {/* Content — centered, readable single-column, widens with viewport */}
            <div className="flex-1 overflow-y-auto px-10 py-8">
              {detailLoading && !currentCarouselDetail && (
                <div className="flex h-full items-center justify-center">
                  <p className="font-mono text-xs text-muted-foreground">Loading…</p>
                </div>
              )}
              {currentCarouselDetail && (
                <div className="mx-auto w-full max-w-3xl xl:max-w-4xl space-y-6">
                  {/* Score + meta */}
                  <div className="flex items-start justify-between gap-6">
                    <div>
                      <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-muted-foreground">
                        {currentCarouselDetail.assessmentType}
                      </p>
                      <p className="mt-1 font-mono text-xs text-muted-foreground">
                        Assessed {fmt(currentCarouselDetail.createdAt)} ·{' '}
                        <a href={currentCarouselDetail.repoUrl} target="_blank" rel="noreferrer"
                          className="text-primary hover:underline">
                          View repo ↗
                        </a>
                      </p>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className={`font-mono text-5xl font-black ${scoreColor(currentCarouselDetail.overallScore)}`}>
                        {currentCarouselDetail.overallScore}
                      </p>
                      <p className="font-mono text-[9px] text-muted-foreground">Overall Score</p>
                    </div>
                  </div>

                  {currentCarouselDetail.executiveSummary && (
                    <section className="rounded-xl border border-border bg-card p-6">
                      <h3 className="mb-2 font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-primary">
                        Executive Summary
                      </h3>
                      <p className="text-sm leading-relaxed text-foreground/80">
                        {currentCarouselDetail.executiveSummary}
                      </p>
                    </section>
                  )}

                  {currentCarouselDetail.scorecard.length > 0 && (
                    <section>
                      <h3 className="mb-3 font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
                        Scorecard
                      </h3>
                      <div className="space-y-2">
                        {currentCarouselDetail.scorecard.map((row, i) => (
                          <div key={i} className="flex items-center gap-3 rounded-lg border border-border bg-card p-3">
                            <span className={`w-8 shrink-0 font-mono text-sm font-black ${scoreColor(row.score, false)}`}>
                              {row.score}
                            </span>
                            <span className="min-w-0 flex-1 font-mono text-xs">{row.criterion}</span>
                            <span className={`shrink-0 rounded-full border px-2 py-0.5 text-[9px] font-bold uppercase ${STATUS_STYLE[row.status]}`}>
                              {row.status}
                            </span>
                          </div>
                        ))}
                      </div>
                    </section>
                  )}

                  {currentCarouselDetail.findings.length > 0 && (
                    <section>
                      <h3 className="mb-3 font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
                        Key Achievements
                      </h3>
                      <ul className="space-y-2">
                        {currentCarouselDetail.findings.map((f, i) => (
                          <li key={i} className="flex items-start gap-3 text-sm">
                            <Icon icon="solar:check-circle-bold" className="mt-0.5 shrink-0 text-emerald-500" />
                            {f}
                          </li>
                        ))}
                      </ul>
                    </section>
                  )}

                  {currentCarouselDetail.gapsAndRisks.length > 0 && (
                    <section>
                      <h3 className="mb-3 font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
                        Gaps & Risks
                      </h3>
                      <ul className="space-y-2">
                        {currentCarouselDetail.gapsAndRisks.map((g, i) => (
                          <li key={i} className="flex items-start gap-3 text-sm text-muted-foreground">
                            <Icon icon="solar:danger-triangle-bold" className="mt-0.5 shrink-0 text-amber-500" />
                            {g}
                          </li>
                        ))}
                      </ul>
                    </section>
                  )}

                  {/* Build button at bottom of right panel */}
                  <div className="border-t border-border pt-6 pb-2">
                    <button
                      type="button"
                      onClick={onBuild}
                      disabled={orderedIds.length === 0}
                      className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-4 font-mono text-sm font-black uppercase tracking-[0.12em] text-primary-foreground shadow-[0_0_24px_rgba(201,100,66,0.18)] transition-opacity hover:opacity-90 disabled:opacity-30"
                    >
                      <Icon icon="solar:magic-stick-3-bold" />
                      Build Portfolio
                      {orderedIds.length > 0 && (
                        <span className="ml-1 rounded-full bg-primary-foreground/20 px-2 py-0.5 font-mono text-[10px]">
                          {orderedIds.length}
                        </span>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
}

// ─── GENERATING ───────────────────────────────────────────────────────────────

function GeneratingView({ sections, assessments, orderedIds }: BuilderProps) {
  return (
    <div className="flex h-[calc(100vh-4.25rem)] items-center justify-center bg-background font-sans">
      <div className="w-full max-w-xl px-8">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
            <Icon icon="solar:magic-stick-3-bold" className="text-2xl text-primary" />
          </div>
          <h2 className="font-heading text-2xl font-bold">Generating Portfolio</h2>
          <p className="mt-1 font-mono text-xs text-muted-foreground">
            Composing summaries from your assessments…
          </p>
        </div>
        <div className="space-y-3">
          {orderedIds.map((id, i) => {
            const summary = assessments.find((a) => a.id === id);
            const section = sections.find((s) => s.id === id);
            const isDone = section && !section.generating;
            const isActive = section?.generating;
            return (
              <div key={id} className="flex items-center gap-4 rounded-xl border border-border bg-card p-4">
                <div className="w-5 shrink-0 text-center">
                  {isDone && <Icon icon="solar:check-circle-bold" className="text-lg text-emerald-500" />}
                  {isActive && <Icon icon="solar:spinner-bold" className="animate-spin text-lg text-primary" />}
                  {!section && <span className="inline-block h-4 w-4 rounded-full border-2 border-border" />}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-mono text-xs font-bold">
                    <span className="mr-1.5 text-muted-foreground">{i + 1}.</span>
                    {summary?.repoOwner}/{summary?.repoName}
                  </p>
                  <p className="font-mono text-[9px] text-muted-foreground">
                    {isDone ? 'Complete' : isActive ? 'Generating…' : 'Queued'}
                  </p>
                </div>
                <div className="h-1.5 w-32 overflow-hidden rounded-full bg-muted">
                  <div className={`h-full rounded-full bg-primary transition-all duration-700 ${isDone ? 'w-full' : isActive ? 'w-2/3' : 'w-0'}`} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── EDITING ──────────────────────────────────────────────────────────────────

function EditingView({
  sections, orderedIds, assessments, onSectionChange, onSave, onExport, onReset, generationError,
}: BuilderProps) {
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({});
  const scrollTo = (id: string) =>
    sectionRefs.current[id]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  const allDone = sections.every((s) => !s.generating);

  return (
    <div className="flex h-[calc(100vh-4.25rem)] overflow-hidden bg-background font-sans text-foreground">
      {/* Left nav — scales with viewport */}
      <aside className="flex w-56 xl:w-64 2xl:w-72 shrink-0 flex-col border-r border-border">
        <div className="border-b border-border px-5 py-5">
          <h2 className="font-heading text-base font-bold">Portfolio Sections</h2>
          <p className="mt-0.5 font-mono text-[9px] text-muted-foreground">
            {sections.length} project{sections.length !== 1 ? 's' : ''} · click to jump
          </p>
        </div>
        <div className="flex-1 overflow-y-auto py-1">
          {orderedIds.map((id, i) => {
            const summary = assessments.find((a) => a.id === id);
            const section = sections.find((s) => s.id === id);
            return (
              <button key={id} type="button" onClick={() => scrollTo(id)}
                className="flex w-full items-center gap-3 px-5 py-3 text-left transition-colors hover:bg-muted/40">
                <span className="shrink-0 font-mono text-[9px] text-muted-foreground">{i + 1}</span>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-mono text-[10px] font-bold">{summary?.repoName}</p>
                  {section?.generating && (
                    <p className="font-mono text-[9px] text-primary">Generating…</p>
                  )}
                </div>
              </button>
            );
          })}
        </div>
        <div className="space-y-2 border-t border-border p-4">
          <button type="button" onClick={onSave} disabled={!allDone}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-2.5 font-mono text-[10px] font-black uppercase tracking-wide text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-40">
            <Icon icon="solar:floppy-disk-bold" /> Save to Docs
          </button>
          <button type="button" onClick={onExport} disabled={!allDone}
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-border py-2.5 font-mono text-[10px] font-bold uppercase tracking-wide transition-colors hover:bg-muted disabled:opacity-40">
            <Icon icon="solar:export-linear" /> Export PDF
          </button>
          <button type="button" onClick={onReset}
            className="w-full py-1 font-mono text-[9px] text-muted-foreground transition-colors hover:text-foreground">
            ← Start over
          </button>
        </div>
      </aside>

      {/* Sections — full remaining width, no artificial cap */}
      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-5xl 2xl:max-w-6xl space-y-10 px-10 py-8">
          {generationError && (
            <div className="rounded-lg border border-destructive/40 bg-destructive/5 px-5 py-4">
              <p className="font-mono text-[10px] font-bold uppercase tracking-widest text-destructive">Generation Failed</p>
              <p className="mt-1 font-mono text-xs text-destructive/80">{generationError}</p>
              <button type="button" onClick={onReset} className="mt-3 font-mono text-[10px] font-bold text-destructive underline hover:no-underline">
                ← Try again
              </button>
            </div>
          )}
          {orderedIds.map((id, i) => {
            const section = sections.find((s) => s.id === id);
            const summary = assessments.find((a) => a.id === id);
            return (
              <section key={id} ref={(el) => { sectionRefs.current[id] = el; }}>
                <div className="mb-3 flex items-center gap-3 border-b border-border pb-3">
                  <span className="font-mono text-[9px] text-muted-foreground">{i + 1}</span>
                  <h3 className="font-heading text-xl font-bold">
                    {summary?.repoOwner}/{summary?.repoName}
                  </h3>
                  {summary && (
                    <span className={`ml-auto font-mono text-xl font-black ${scoreColor(summary.overallScore)}`}>
                      {summary.overallScore}
                    </span>
                  )}
                </div>
                {section?.generating ? (
                  <div className="h-52 animate-pulse rounded-2xl border border-border bg-muted/30" />
                ) : section?.data ? (
                  <PortfolioSectionCard
                    data={section.data}
                    onChange={(patch) => onSectionChange(id, patch)}
                  />
                ) : (
                  <div className="flex h-32 items-center justify-center rounded-2xl border border-border bg-muted/20">
                    <p className="font-mono text-xs text-muted-foreground">No data generated for this section.</p>
                  </div>
                )}
              </section>
            );
          })}

          {allDone && (
            <div className="flex gap-3 border-t border-border pt-6">
              <button type="button" onClick={onSave}
                className="flex-1 rounded-xl bg-primary py-4 font-mono text-sm font-black uppercase tracking-[0.12em] text-primary-foreground shadow-[0_0_24px_rgba(201,100,66,0.18)] transition-opacity hover:opacity-90">
                Save Portfolio
              </button>
              <button type="button" onClick={onExport}
                className="flex items-center gap-2 rounded-xl border border-border px-8 py-4 font-mono text-sm font-bold uppercase tracking-wide transition-colors hover:bg-muted">
                <Icon icon="solar:export-linear" /> Export PDF
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
