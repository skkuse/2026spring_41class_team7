'use client';

import { Icon } from '@iconify/react';
import { useEffect, useState } from 'react';

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

export function BuilderMobile(props: BuilderProps) {
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
      <header className="sticky top-0 z-10 border-b border-border bg-background/90 px-4 py-4 backdrop-blur">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-heading text-lg font-bold">Portfolio Builder</h1>
            <p className="font-mono text-[9px] text-muted-foreground">
              {orderedIds.length > 0
                ? `${orderedIds.length} selected`
                : 'Check projects to include'}
            </p>
          </div>
          <button
            type="button"
            onClick={onBuild}
            disabled={orderedIds.length === 0}
            className="flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 font-mono text-[10px] font-black uppercase tracking-wide text-primary-foreground disabled:opacity-30"
          >
            <Icon icon="solar:magic-stick-3-bold" className="text-sm" />
            Build
          </button>
        </div>
      </header>

      <div className="px-4 py-4 space-y-6">
        {/* Project list */}
        <div className="space-y-2">
          {listLoading && <p className="font-mono text-xs text-muted-foreground">Loading…</p>}
          {!listLoading && assessments.length === 0 && (
            <p className="font-mono text-xs text-muted-foreground">
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
                className={`flex items-center gap-3 rounded-xl border p-3 transition-colors ${isActive ? 'border-primary/40 bg-primary/5' : 'border-border bg-card'}`}
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
                  <p className="truncate font-mono text-[10px] font-bold">
                    {isChecked && <span className="mr-1 text-primary">{pos + 1}.</span>}
                    {a.repoOwner}/{a.repoName}
                  </p>
                  <p className="font-mono text-[9px] text-muted-foreground">
                    <span className={scoreColor(a.overallScore)}>{a.overallScore}</span>/100 · {a.assessmentType}
                  </p>
                </button>

                {isChecked && (
                  <div className="flex shrink-0 flex-col gap-0.5">
                    <button type="button" onClick={() => onMoveUp(a.id)} disabled={pos === 0}
                      className="p-1 text-muted-foreground disabled:opacity-20">
                      <Icon icon="solar:alt-arrow-up-linear" className="text-sm" />
                    </button>
                    <button type="button" onClick={() => onMoveDown(a.id)} disabled={pos === orderedIds.length - 1}
                      className="p-1 text-muted-foreground disabled:opacity-20">
                      <Icon icon="solar:alt-arrow-down-linear" className="text-sm" />
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Carousel preview */}
        {orderedIds.length > 0 && (
          <div>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-mono text-[9px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
                Preview
              </h2>
              <div className="flex items-center gap-2">
                <button type="button" onClick={() => setCarouselIdx(Math.max(0, carouselIdx - 1))}
                  disabled={carouselIdx === 0}
                  className="flex h-6 w-6 items-center justify-center rounded-full border border-border text-muted-foreground disabled:opacity-30">
                  <Icon icon="solar:arrow-left-linear" className="text-xs" />
                </button>
                <div className="flex gap-1">
                  {orderedIds.map((_, i) => (
                    <button key={i} type="button" onClick={() => setCarouselIdx(i)}
                      className={`h-1 rounded-full transition-all ${i === carouselIdx ? 'w-4 bg-primary' : 'w-1.5 bg-border'}`} />
                  ))}
                </div>
                <button type="button" onClick={() => setCarouselIdx(Math.min(orderedIds.length - 1, carouselIdx + 1))}
                  disabled={carouselIdx === orderedIds.length - 1}
                  className="flex h-6 w-6 items-center justify-center rounded-full border border-border text-muted-foreground disabled:opacity-30">
                  <Icon icon="solar:arrow-right-linear" className="text-xs" />
                </button>
              </div>
            </div>

            {detailLoading && !currentCarouselDetail && (
              <p className="font-mono text-xs text-muted-foreground">Loading…</p>
            )}
            {currentCarouselDetail && currentCarouselSummary && (
              <div className="rounded-xl border border-border bg-card p-4 space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate font-mono text-xs font-bold">
                      {currentCarouselSummary.repoOwner}/{currentCarouselSummary.repoName}
                    </p>
                    <p className="font-mono text-[9px] text-muted-foreground">
                      {fmt(currentCarouselDetail.createdAt)}
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className={`font-mono text-2xl font-black ${scoreColor(currentCarouselDetail.overallScore)}`}>
                      {currentCarouselDetail.overallScore}
                    </p>
                    <p className="font-mono text-[8px] text-muted-foreground">Overall</p>
                  </div>
                </div>

                {currentCarouselDetail.executiveSummary && (
                  <p className="text-xs leading-relaxed text-foreground/80 line-clamp-4">
                    {currentCarouselDetail.executiveSummary}
                  </p>
                )}

                {currentCarouselDetail.findings.slice(0, 3).map((f, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs">
                    <Icon icon="solar:check-circle-bold" className="mt-0.5 shrink-0 text-emerald-500" />
                    <span>{f}</span>
                  </div>
                ))}

                {currentCarouselDetail.scorecard.length > 0 && (
                  <div className="space-y-1.5">
                    {currentCarouselDetail.scorecard.slice(0, 3).map((row, i) => (
                      <div key={i} className="flex items-center gap-2 rounded-lg border border-border p-2">
                        <span className={`w-6 shrink-0 font-mono text-xs font-black ${scoreColor(row.score, false)}`}>{row.score}</span>
                        <span className="min-w-0 flex-1 truncate font-mono text-[9px]">{row.criterion}</span>
                        <span className={`shrink-0 rounded-full border px-1.5 py-0.5 text-[8px] font-bold uppercase ${STATUS_STYLE[row.status]}`}>{row.status}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── GENERATING ───────────────────────────────────────────────────────────────

function GeneratingView({ sections, assessments, orderedIds }: BuilderProps) {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const start = Date.now();
    const id = setInterval(() => setElapsed(Date.now() - start), 80);
    return () => clearInterval(id);
  }, []);

  const doneCount = sections.filter((s) => !s.generating && s.data).length;

  return (
    <div className="flex min-h-screen items-center justify-center bg-background pb-nav-safe font-sans px-4">
      <div className="w-full max-w-sm">
        <div className="mb-6 text-center">
          <div className="relative mx-auto mb-4 flex h-14 w-14 items-center justify-center">
            <span className="absolute inset-0 animate-ping rounded-full bg-primary/20" />
            <span className="absolute inset-1 rounded-full bg-primary/10" />
            <Icon icon="solar:magic-stick-3-bold" className="relative text-2xl text-primary" />
          </div>
          <h2 className="font-heading text-xl font-bold">Generating</h2>
          <p className="font-mono text-xs text-muted-foreground">Composing portfolio sections…</p>
          <div className="mt-3 flex items-center justify-center gap-2">
            <div className="h-1.5 w-32 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary transition-all duration-500"
                style={{ width: `${orderedIds.length ? (doneCount / orderedIds.length) * 100 : 0}%` }}
              />
            </div>
            <span className="font-mono text-[9px] text-muted-foreground">{doneCount}/{orderedIds.length}</span>
          </div>
        </div>

        <div className="space-y-2">
          {orderedIds.map((id, i) => {
            const summary = assessments.find((a) => a.id === id);
            const section = sections.find((s) => s.id === id);
            const isDone = !!(section && !section.generating && section.data);
            const sectionElapsed = Math.max(0, elapsed - i * 1200);
            const isStarted = sectionElapsed > 0;
            const fakePercent = isDone
              ? 100
              : isStarted
              ? Math.min(88, (1 - Math.exp(-sectionElapsed / 10000)) * 92)
              : 0;

            return (
              <div
                key={id}
                className={`flex items-center gap-3 rounded-xl border p-3 transition-all duration-500 ${
                  isDone
                    ? 'border-emerald-200/40 bg-emerald-50/5'
                    : isStarted
                    ? 'border-primary/30 bg-primary/5'
                    : 'border-border bg-card opacity-50'
                }`}
              >
                <div className="w-5 shrink-0">
                  {isDone ? (
                    <Icon icon="solar:check-circle-bold" className="text-base text-emerald-500" />
                  ) : isStarted ? (
                    <Icon icon="solar:spinner-bold" className="animate-spin text-base text-primary" />
                  ) : (
                    <span className="inline-block h-4 w-4 rounded-full border-2 border-border" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-mono text-[10px] font-bold">
                    <span className="mr-1 text-muted-foreground">{i + 1}.</span>
                    {summary?.repoName}
                  </p>
                  <p className={`font-mono text-[9px] ${isDone ? 'text-emerald-500' : isStarted ? 'text-primary' : 'text-muted-foreground'}`}>
                    {isDone ? 'Done' : isStarted ? 'Generating…' : 'Queued'}
                  </p>
                </div>
                <div className="h-1 w-20 overflow-hidden rounded-full bg-muted">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${isDone ? 'bg-emerald-500' : 'bg-primary'}`}
                    style={{ width: `${fakePercent}%` }}
                  />
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

function EditingView({ sections, orderedIds, assessments, onSectionChange, onSave, onExport, onReset, isSaving, saveSuccess, saveError }: BuilderProps) {
  const allDone = sections.every((s) => !s.generating);
  return (
    <div className="min-h-screen bg-background pb-nav-safe font-sans text-foreground">
      <header className="sticky top-0 z-10 border-b border-border bg-background/90 px-4 py-3 backdrop-blur">
        <div className="flex items-center gap-2">
          <button type="button" onClick={onReset} className="text-muted-foreground">
            <Icon icon="solar:arrow-left-linear" className="text-xl" />
          </button>
          <div className="flex-1">
            <h1 className="font-heading text-base font-bold">Edit Portfolio</h1>
            <p className="font-mono text-[9px] text-muted-foreground">
              {sections.length} section{sections.length !== 1 ? 's' : ''}
            </p>
          </div>
          <button type="button" onClick={onExport} disabled={!allDone}
            className="rounded-lg border border-border px-3 py-1.5 font-mono text-[9px] font-bold uppercase disabled:opacity-40">
            Export
          </button>
          <button type="button" onClick={onSave} disabled={!allDone || isSaving}
            className={`flex items-center gap-1 rounded-lg px-3 py-1.5 font-mono text-[9px] font-black uppercase text-primary-foreground disabled:opacity-40 ${saveError ? 'bg-destructive' : 'bg-primary'}`}>
            <Icon icon={saveSuccess ? 'solar:check-circle-bold' : isSaving ? 'solar:spinner-bold' : saveError ? 'solar:close-circle-bold' : 'solar:floppy-disk-bold'}
              className={isSaving ? 'animate-spin text-[10px]' : 'text-[10px]'} />
            {saveSuccess ? 'Saved!' : isSaving ? 'Saving…' : saveError ? 'Failed' : 'Save'}
          </button>
        </div>
      </header>

      <div className="space-y-6 px-4 py-4">
        {orderedIds.map((id, i) => {
          const section = sections.find((s) => s.id === id);
          const summary = assessments.find((a) => a.id === id);
          return (
            <section key={id}>
              <div className="mb-2 flex items-center gap-2 border-b border-border pb-2">
                <span className="font-mono text-[9px] text-muted-foreground">{i + 1}</span>
                <h3 className="font-heading text-base font-bold truncate flex-1">
                  {summary?.repoOwner}/{summary?.repoName}
                </h3>
                {summary && (
                  <span className={`shrink-0 font-mono text-sm font-black ${scoreColor(summary.overallScore)}`}>
                    {summary.overallScore}
                  </span>
                )}
              </div>
              {section?.generating ? (
                <div className="h-32 animate-pulse rounded-2xl border border-border bg-muted/30" />
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
