'use client';

import { Icon } from '@iconify/react';

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

export function BuilderTablet(props: BuilderProps) {
  if (props.phase === 'generating') return <GeneratingView {...props} />;
  if (props.phase === 'editing') return <EditingView {...props} />;
  return <SelectView {...props} />;
}

// ─── SELECT ───────────────────────────────────────────────────────────────────

function SelectView({
  assessments, listLoading, orderedIds, carouselIdx, setCarouselIdx,
  currentCarouselSummary, currentCarouselDetail, detailLoading,
  onToggle, onMoveUp, onMoveDown, onBuild,
}: BuilderProps) {
  return (
    <div className="min-h-screen bg-background pb-nav-safe font-sans text-foreground">
      <header className="sticky top-0 z-10 border-b border-border bg-background/90 backdrop-blur">
        <div className="mx-auto max-w-3xl px-6 py-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-muted-foreground">
                Portfolio Builder
              </p>
              <h1 className="font-heading text-xl font-bold">Select Projects</h1>
            </div>
            <button
              type="button"
              onClick={onBuild}
              disabled={orderedIds.length === 0}
              className="flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 font-mono text-xs font-black uppercase tracking-wide text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-30"
            >
              <Icon icon="solar:magic-stick-3-bold" />
              Build
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-3xl px-6 py-6 space-y-6">
        {/* Project checklist */}
        <section>
          {listLoading && <p className="font-mono text-xs text-muted-foreground">Loading…</p>}
          <div className="space-y-2">
            {assessments.map((a) => {
              const pos = orderedIds.indexOf(a.id);
              const isChecked = pos !== -1;
              const isActive = orderedIds[carouselIdx] === a.id;
              return (
                <div
                  key={a.id}
                  className={`flex items-center gap-3 rounded-xl border p-4 transition-colors ${isActive ? 'border-primary/40 bg-primary/5' : 'border-border bg-card'}`}
                >
                  <button type="button" onClick={() => onToggle(a.id)} className="shrink-0">
                    <div className={`flex h-5 w-5 items-center justify-center rounded border-2 transition-colors ${isChecked ? 'border-primary bg-primary' : 'border-border bg-background'}`}>
                      {isChecked && <Icon icon="solar:check-read-linear" className="text-[10px] text-primary-foreground" />}
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => isChecked && setCarouselIdx(pos)}
                    disabled={!isChecked}
                    className="min-w-0 flex-1 text-left"
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
                    <div className="flex shrink-0 gap-1">
                      <button type="button" onClick={() => onMoveUp(a.id)} disabled={pos === 0}
                        className="rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-20">
                        <Icon icon="solar:alt-arrow-up-linear" className="text-sm" />
                      </button>
                      <button type="button" onClick={() => onMoveDown(a.id)} disabled={pos === orderedIds.length - 1}
                        className="rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-20">
                        <Icon icon="solar:alt-arrow-down-linear" className="text-sm" />
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* Carousel preview */}
        {orderedIds.length > 0 && (
          <section>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
                Preview
              </h2>
              <div className="flex items-center gap-2">
                <button type="button" onClick={() => setCarouselIdx(Math.max(0, carouselIdx - 1))}
                  disabled={carouselIdx === 0}
                  className="flex h-7 w-7 items-center justify-center rounded-full border border-border text-muted-foreground disabled:opacity-30">
                  <Icon icon="solar:arrow-left-linear" className="text-sm" />
                </button>
                <span className="font-mono text-[10px] text-muted-foreground">
                  {carouselIdx + 1}/{orderedIds.length}
                </span>
                <button type="button" onClick={() => setCarouselIdx(Math.min(orderedIds.length - 1, carouselIdx + 1))}
                  disabled={carouselIdx === orderedIds.length - 1}
                  className="flex h-7 w-7 items-center justify-center rounded-full border border-border text-muted-foreground disabled:opacity-30">
                  <Icon icon="solar:arrow-right-linear" className="text-sm" />
                </button>
              </div>
            </div>

            <div className="flex gap-1.5 mb-4">
              {orderedIds.map((_, i) => (
                <button key={i} type="button" onClick={() => setCarouselIdx(i)}
                  className={`h-1 rounded-full transition-all ${i === carouselIdx ? 'w-6 bg-primary' : 'w-2 bg-border'}`} />
              ))}
            </div>

            {detailLoading && !currentCarouselDetail && (
              <p className="font-mono text-xs text-muted-foreground">Loading…</p>
            )}
            {currentCarouselDetail && currentCarouselSummary && (
              <div className="space-y-4 rounded-xl border border-border bg-card p-6">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-mono text-[9px] uppercase tracking-wide text-muted-foreground">
                      {currentCarouselDetail.assessmentType}
                    </p>
                    <p className="font-heading text-lg font-bold">
                      {currentCarouselSummary.repoOwner}/{currentCarouselSummary.repoName}
                    </p>
                    <p className="font-mono text-[10px] text-muted-foreground">
                      {fmt(currentCarouselDetail.createdAt)}
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className={`font-mono text-3xl font-black ${scoreColor(currentCarouselDetail.overallScore)}`}>
                      {currentCarouselDetail.overallScore}
                    </p>
                    <p className="font-mono text-[9px] text-muted-foreground">Overall</p>
                  </div>
                </div>

                {currentCarouselDetail.executiveSummary && (
                  <p className="text-sm leading-relaxed text-foreground/80">
                    {currentCarouselDetail.executiveSummary}
                  </p>
                )}

                {currentCarouselDetail.findings.length > 0 && (
                  <ul className="space-y-1.5">
                    {currentCarouselDetail.findings.slice(0, 4).map((f, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <Icon icon="solar:check-circle-bold" className="mt-0.5 shrink-0 text-emerald-500" />
                        {f}
                      </li>
                    ))}
                  </ul>
                )}

                {currentCarouselDetail.scorecard.length > 0 && (
                  <div className="grid grid-cols-2 gap-2">
                    {currentCarouselDetail.scorecard.slice(0, 4).map((row, i) => (
                      <div key={i} className="flex items-center gap-2 rounded-lg border border-border p-2">
                        <span className={`shrink-0 font-mono text-sm font-black ${scoreColor(row.score, false)}`}>{row.score}</span>
                        <span className="min-w-0 flex-1 truncate font-mono text-[10px]">{row.criterion}</span>
                        <span className={`shrink-0 rounded-full border px-1.5 py-0.5 text-[8px] font-bold uppercase ${STATUS_STYLE[row.status]}`}>
                          {row.status}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </section>
        )}
      </div>
    </div>
  );
}

// ─── GENERATING ───────────────────────────────────────────────────────────────

function GeneratingView({ sections, assessments, orderedIds }: BuilderProps) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background pb-nav-safe font-sans">
      <div className="w-full max-w-md px-6">
        <div className="mb-6 text-center">
          <Icon icon="solar:magic-stick-3-bold" className="mx-auto mb-3 text-3xl text-primary" />
          <h2 className="font-heading text-xl font-bold">Generating Portfolio</h2>
          <p className="font-mono text-xs text-muted-foreground">Composing from assessments…</p>
        </div>
        <div className="space-y-3">
          {orderedIds.map((id, i) => {
            const summary = assessments.find((a) => a.id === id);
            const section = sections.find((s) => s.id === id);
            const isDone = section && !section.generating;
            const isActive = section?.generating;
            return (
              <div key={id} className="flex items-center gap-3 rounded-xl border border-border bg-card p-4">
                <div className="w-5 shrink-0">
                  {isDone && <Icon icon="solar:check-circle-bold" className="text-lg text-emerald-500" />}
                  {isActive && <Icon icon="solar:spinner-bold" className="animate-spin text-lg text-primary" />}
                  {!section && <span className="inline-block h-4 w-4 rounded-full border-2 border-border" />}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-mono text-xs font-bold">
                    <span className="mr-1 text-muted-foreground">{i + 1}.</span>
                    {summary?.repoOwner}/{summary?.repoName}
                  </p>
                  <p className="font-mono text-[9px] text-muted-foreground">
                    {isDone ? 'Complete' : isActive ? 'Generating…' : 'Queued'}
                  </p>
                </div>
                <div className="h-1.5 w-20 overflow-hidden rounded-full bg-muted">
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

function EditingView({ sections, orderedIds, assessments, onSectionChange, onSave, onExport, onReset }: BuilderProps) {
  const allDone = sections.every((s) => !s.generating);
  return (
    <div className="min-h-screen bg-background pb-nav-safe font-sans text-foreground">
      <header className="sticky top-0 z-10 border-b border-border bg-background/90 backdrop-blur">
        <div className="mx-auto max-w-3xl px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-mono text-[9px] uppercase tracking-wide text-muted-foreground">
                Portfolio Builder
              </p>
              <h1 className="font-heading text-lg font-bold">Edit Sections</h1>
            </div>
            <div className="flex gap-2">
              <button type="button" onClick={onReset}
                className="rounded-lg border border-border px-3 py-2 font-mono text-[10px] font-bold uppercase text-muted-foreground hover:bg-muted">
                ← Back
              </button>
              <button type="button" onClick={onExport} disabled={!allDone}
                className="rounded-lg border border-border px-3 py-2 font-mono text-[10px] font-bold uppercase disabled:opacity-40">
                Export
              </button>
              <button type="button" onClick={onSave} disabled={!allDone}
                className="rounded-lg bg-primary px-4 py-2 font-mono text-[10px] font-black uppercase tracking-wide text-primary-foreground disabled:opacity-40">
                Save
              </button>
            </div>
          </div>
        </div>
      </header>
      <div className="mx-auto max-w-3xl space-y-8 px-6 py-6">
        {orderedIds.map((id, i) => {
          const section = sections.find((s) => s.id === id);
          const summary = assessments.find((a) => a.id === id);
          return (
            <section key={id}>
              <div className="mb-3 flex items-center gap-3 border-b border-border pb-3">
                <span className="font-mono text-[9px] text-muted-foreground">{i + 1}</span>
                <h3 className="font-heading text-lg font-bold">{summary?.repoOwner}/{summary?.repoName}</h3>
                {summary && (
                  <span className={`ml-auto font-mono font-black ${scoreColor(summary.overallScore)}`}>
                    {summary.overallScore}
                  </span>
                )}
              </div>
              {section?.generating ? (
                <div className="h-40 animate-pulse rounded-2xl border border-border bg-muted/30" />
              ) : section?.data ? (
                <PortfolioSectionCard
                  data={section.data}
                  onChange={(patch) => onSectionChange(id, patch)}
                />
              ) : (
                <div className="flex h-24 items-center justify-center rounded-2xl border border-border bg-muted/20">
                  <p className="font-mono text-xs text-muted-foreground">No data generated.</p>
                </div>
              )}
            </section>
          );
        })}
      </div>
    </div>
  );
}
