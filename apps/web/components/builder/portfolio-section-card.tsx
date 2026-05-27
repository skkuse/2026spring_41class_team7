'use client';

import { Icon } from '@iconify/react';
import { useState } from 'react';

import type { PortfolioHighlight, PortfolioSectionData } from './builder-types';

type Props = {
  data: PortfolioSectionData;
  onChange: (patch: Partial<PortfolioSectionData>) => void;
};

export function PortfolioSectionCard({ data, onChange }: Props) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<PortfolioSectionData>(data);

  const handleEdit = () => {
    setDraft(data);
    setEditing(true);
  };

  const handleSave = () => {
    onChange(draft);
    setEditing(false);
  };

  const handleCancel = () => {
    setDraft(data);
    setEditing(false);
  };

  if (editing) {
    return (
      <EditCard
        draft={draft}
        setDraft={setDraft}
        onSave={handleSave}
        onCancel={handleCancel}
      />
    );
  }

  return <ViewCard data={data} onEdit={handleEdit} />;
}

// ─── VIEW ─────────────────────────────────────────────────────────────────────

function ViewCard({ data, onEdit }: { data: PortfolioSectionData; onEdit: () => void }) {
  return (
    <div className="rounded-2xl border border-border bg-card shadow-sm">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 border-b border-border px-7 py-6">
        <div className="min-w-0 flex-1">
          <h3 className="font-heading text-xl font-bold leading-snug">{data.headline}</h3>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-muted px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-wide text-foreground">
              <Icon icon="solar:user-rounded-bold" className="text-primary" />
              {data.role}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-muted px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-wide text-foreground">
              <Icon icon="solar:calendar-bold" className="text-primary" />
              {data.duration}
            </span>
            <span className="ml-auto font-mono text-2xl font-black text-primary">
              {data.overallScore}
              <span className="ml-0.5 text-xs font-normal text-muted-foreground">/100</span>
            </span>
          </div>
        </div>
        <button
          type="button"
          onClick={onEdit}
          className="shrink-0 flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 font-mono text-[10px] font-bold uppercase tracking-wide transition-colors hover:bg-muted"
        >
          <Icon icon="solar:pen-linear" />
          Edit
        </button>
      </div>

      <div className="space-y-5 px-7 py-6">
        {/* Summary */}
        <p className="text-sm leading-relaxed text-foreground/80">{data.summary}</p>

        {/* Tech stack */}
        {data.techStack.length > 0 && (
          <div>
            <p className="mb-2 font-mono text-[9px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
              Tech Stack
            </p>
            <div className="flex flex-wrap gap-1.5">
              {data.techStack.map((t) => (
                <span
                  key={t}
                  className="rounded-md border border-border bg-muted/60 px-2.5 py-1 font-mono text-[10px] font-bold text-foreground"
                >
                  {t}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Highlights */}
        {data.highlights.length > 0 && (
          <div>
            <p className="mb-3 font-mono text-[9px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
              Highlights
            </p>
            <div className="space-y-3">
              {data.highlights.map((h, i) => (
                <div key={i} className="flex gap-3">
                  <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10">
                    <Icon icon="solar:star-bold" className="text-[10px] text-primary" />
                  </div>
                  <div>
                    <p className="font-mono text-xs font-bold">{h.title}</p>
                    <p className="mt-0.5 text-sm leading-relaxed text-foreground/70">{h.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Impact */}
        {data.impact && (
          <div className="rounded-xl border border-primary/20 bg-primary/5 px-5 py-4">
            <p className="mb-1 font-mono text-[9px] font-bold uppercase tracking-[0.2em] text-primary">
              Impact
            </p>
            <p className="text-sm leading-relaxed text-foreground/80">{data.impact}</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── EDIT ─────────────────────────────────────────────────────────────────────

function EditCard({
  draft,
  setDraft,
  onSave,
  onCancel,
}: {
  draft: PortfolioSectionData;
  setDraft: (d: PortfolioSectionData) => void;
  onSave: () => void;
  onCancel: () => void;
}) {
  const set = <K extends keyof PortfolioSectionData>(key: K, value: PortfolioSectionData[K]) =>
    setDraft({ ...draft, [key]: value });

  const setHighlight = (i: number, patch: Partial<PortfolioHighlight>) =>
    setDraft({
      ...draft,
      highlights: draft.highlights.map((h, idx) => (idx === i ? { ...h, ...patch } : h)),
    });

  const addHighlight = () =>
    setDraft({ ...draft, highlights: [...draft.highlights, { title: '', description: '' }] });

  const removeHighlight = (i: number) =>
    setDraft({ ...draft, highlights: draft.highlights.filter((_, idx) => idx !== i) });

  const fieldCls =
    'w-full rounded-lg border border-border bg-background px-3 py-2 font-mono text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30';
  const labelCls = 'mb-1 block font-mono text-[9px] font-bold uppercase tracking-[0.2em] text-muted-foreground';

  return (
    <div className="rounded-2xl border border-primary/30 bg-card shadow-sm ring-2 ring-primary/10">
      <div className="flex items-center justify-between border-b border-border px-7 py-5">
        <p className="font-mono text-xs font-bold uppercase tracking-wide text-primary">Editing Section</p>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg border border-border px-4 py-2 font-mono text-[10px] font-bold uppercase tracking-wide transition-colors hover:bg-muted"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onSave}
            className="rounded-lg bg-primary px-4 py-2 font-mono text-[10px] font-bold uppercase tracking-wide text-primary-foreground transition-opacity hover:opacity-90"
          >
            Save
          </button>
        </div>
      </div>

      <div className="space-y-5 px-7 py-6">
        {/* Headline */}
        <div>
          <label className={labelCls}>Headline</label>
          <input
            className={fieldCls}
            value={draft.headline}
            onChange={(e) => set('headline', e.target.value)}
            placeholder="8–14 word punchy headline…"
          />
        </div>

        {/* Role + Duration */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Role</label>
            <input
              className={fieldCls}
              value={draft.role}
              onChange={(e) => set('role', e.target.value)}
              placeholder="e.g. Full-Stack Engineer"
            />
          </div>
          <div>
            <label className={labelCls}>Duration</label>
            <input
              className={fieldCls}
              value={draft.duration}
              onChange={(e) => set('duration', e.target.value)}
              placeholder="e.g. ~6 months"
            />
          </div>
        </div>

        {/* Summary */}
        <div>
          <label className={labelCls}>Summary</label>
          <textarea
            className={`${fieldCls} resize-y`}
            rows={4}
            value={draft.summary}
            onChange={(e) => set('summary', e.target.value)}
            placeholder="2–3 sentences in first person…"
          />
        </div>

        {/* Tech Stack */}
        <div>
          <label className={labelCls}>Tech Stack (comma-separated)</label>
          <input
            className={fieldCls}
            value={draft.techStack.join(', ')}
            onChange={(e) =>
              set(
                'techStack',
                e.target.value
                  .split(',')
                  .map((t) => t.trim())
                  .filter(Boolean),
              )
            }
            placeholder="React, TypeScript, PostgreSQL…"
          />
        </div>

        {/* Highlights */}
        <div>
          <div className="mb-2 flex items-center justify-between">
            <label className={labelCls} style={{ marginBottom: 0 }}>Highlights</label>
            <button
              type="button"
              onClick={addHighlight}
              className="font-mono text-[9px] font-bold text-primary hover:underline"
            >
              + Add
            </button>
          </div>
          <div className="space-y-3">
            {draft.highlights.map((h, i) => (
              <div key={i} className="rounded-lg border border-border p-3">
                <div className="mb-2 flex items-center justify-between">
                  <span className="font-mono text-[9px] text-muted-foreground">#{i + 1}</span>
                  <button
                    type="button"
                    onClick={() => removeHighlight(i)}
                    className="font-mono text-[9px] text-muted-foreground hover:text-destructive"
                  >
                    Remove
                  </button>
                </div>
                <input
                  className={`${fieldCls} mb-2`}
                  value={h.title}
                  onChange={(e) => setHighlight(i, { title: e.target.value })}
                  placeholder="Title (≤8 words)"
                />
                <textarea
                  className={`${fieldCls} resize-y`}
                  rows={2}
                  value={h.description}
                  onChange={(e) => setHighlight(i, { description: e.target.value })}
                  placeholder="1–2 sentence description…"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Impact */}
        <div>
          <label className={labelCls}>Impact</label>
          <textarea
            className={`${fieldCls} resize-y`}
            rows={3}
            value={draft.impact}
            onChange={(e) => set('impact', e.target.value)}
            placeholder="1–2 sentences of measurable outcome…"
          />
        </div>
      </div>
    </div>
  );
}
