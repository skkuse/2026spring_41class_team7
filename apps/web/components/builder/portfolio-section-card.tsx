'use client';

import { Icon } from '@iconify/react';
import { useRef, useState } from 'react';

import type { PortfolioHighlight, PortfolioSectionData } from './builder-types';

type Props = {
  data: PortfolioSectionData;
  onChange: (patch: Partial<PortfolioSectionData>) => void;
};

export function PortfolioSectionCard({ data, onChange }: Props) {
  const [isEditing, setIsEditing] = useState(false);
  const [newTag, setNewTag] = useState('');
  const tagInputRef = useRef<HTMLInputElement>(null);

  const set = <K extends keyof PortfolioSectionData>(key: K, value: PortfolioSectionData[K]) =>
    onChange({ [key]: value } as Partial<PortfolioSectionData>);

  const setHighlight = (i: number, patch: Partial<PortfolioHighlight>) =>
    onChange({
      highlights: data.highlights.map((h, idx) => (idx === i ? { ...h, ...patch } : h)),
    });

  const addHighlight = () =>
    onChange({ highlights: [...data.highlights, { title: '', description: '' }] });

  const removeHighlight = (i: number) =>
    onChange({ highlights: data.highlights.filter((_, idx) => idx !== i) });

  const commitTag = () => {
    const t = newTag.trim();
    if (!t) return;
    onChange({ techStack: [...data.techStack, t] });
    setNewTag('');
  };

  const removeTag = (i: number) =>
    onChange({ techStack: data.techStack.filter((_, idx) => idx !== i) });

  const inlineField =
    'bg-transparent outline-none focus:ring-2 focus:ring-primary/20 rounded px-1 -ml-1 transition-colors hover:bg-muted/30 w-full';

  return (
    <div className={`rounded-2xl border bg-card shadow-sm transition-colors ${isEditing ? 'border-primary/50 ring-2 ring-primary/10' : 'border-border'}`}>
      {/* ── Header ── */}
      <div className="border-b border-border px-7 py-6">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            {isEditing ? (
              <input
                className={`${inlineField} font-heading text-xl font-bold leading-snug`}
                value={data.headline}
                onChange={(e) => set('headline', e.target.value)}
                placeholder="Headline…"
                autoFocus
              />
            ) : (
              <p className="font-heading text-xl font-bold leading-snug">{data.headline || <span className="text-muted-foreground/50">No headline</span>}</p>
            )}
          </div>

          {/* Edit / Done button */}
          <button
            type="button"
            onClick={() => setIsEditing((v) => !v)}
            className={`shrink-0 flex items-center gap-1.5 rounded-lg border px-3 py-1.5 font-mono text-[10px] font-bold uppercase tracking-wide transition-colors ${
              isEditing
                ? 'border-primary bg-primary text-primary-foreground hover:opacity-90'
                : 'border-border bg-muted/40 text-muted-foreground hover:border-primary/40 hover:text-primary'
            }`}
          >
            <Icon icon={isEditing ? 'solar:check-read-bold' : 'solar:pen-bold'} className="text-xs" />
            {isEditing ? 'Done' : 'Edit'}
          </button>
        </div>

        <div className="mt-2 flex flex-wrap items-center gap-2">
          {/* Role pill */}
          <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-muted px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-wide text-foreground">
            <Icon icon="solar:user-rounded-bold" className="shrink-0 text-primary" />
            {isEditing ? (
              <input
                className="w-28 bg-transparent font-mono text-[10px] font-bold uppercase tracking-wide outline-none"
                value={data.role}
                onChange={(e) => set('role', e.target.value)}
                placeholder="Role"
              />
            ) : (
              <span>{data.role || 'Role'}</span>
            )}
          </span>

          {/* Duration pill */}
          <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-muted px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-wide text-foreground">
            <Icon icon="solar:calendar-bold" className="shrink-0 text-primary" />
            {isEditing ? (
              <input
                className="w-24 bg-transparent font-mono text-[10px] font-bold uppercase tracking-wide outline-none"
                value={data.duration}
                onChange={(e) => set('duration', e.target.value)}
                placeholder="Duration"
              />
            ) : (
              <span>{data.duration || 'Duration'}</span>
            )}
          </span>

          <span className="ml-auto font-mono text-2xl font-black text-primary">
            {data.overallScore}
            <span className="ml-0.5 text-xs font-normal text-muted-foreground">/100</span>
          </span>
        </div>
      </div>

      <div className={`space-y-5 px-7 py-6 ${isEditing ? 'rounded-b-2xl bg-primary/[0.02]' : ''}`}>
        {/* Edit mode indicator banner */}
        {isEditing && (
          <div className="flex items-center gap-2 rounded-lg border border-primary/20 bg-primary/5 px-3 py-2">
            <Icon icon="solar:pen-bold" className="shrink-0 text-xs text-primary" />
            <p className="font-mono text-[9px] font-bold uppercase tracking-[0.15em] text-primary">
              Editing — click any field to modify
            </p>
          </div>
        )}

        {/* ── Summary ── */}
        {isEditing ? (
          <AutoTextarea
            className={`${inlineField} resize-none text-sm leading-relaxed text-foreground/80`}
            value={data.summary}
            onChange={(v) => set('summary', v)}
            placeholder="Project summary…"
            minRows={3}
          />
        ) : (
          <p className="text-sm leading-relaxed text-foreground/80">{data.summary}</p>
        )}

        {/* ── Tech Stack ── */}
        <div>
          <p className="mb-2 font-mono text-[9px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
            Tech Stack
          </p>
          <div className="flex flex-wrap gap-1.5">
            {data.techStack.map((t, i) => (
              <span
                key={i}
                className="group/tag inline-flex items-center gap-1 rounded-md border border-border bg-muted/60 px-2.5 py-1 font-mono text-[10px] font-bold text-foreground"
              >
                {t}
                {isEditing && (
                  <button
                    type="button"
                    onClick={() => removeTag(i)}
                    className="ml-0.5 text-muted-foreground hover:text-destructive transition-colors"
                    aria-label={`Remove ${t}`}
                  >
                    <Icon icon="solar:close-circle-bold" className="text-xs" />
                  </button>
                )}
              </span>
            ))}
            {isEditing && (
              <span className="inline-flex items-center rounded-md border border-dashed border-primary/40 px-2.5 py-1">
                <input
                  ref={tagInputRef}
                  className="w-20 bg-transparent font-mono text-[10px] outline-none placeholder:text-muted-foreground/50"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ',') {
                      e.preventDefault();
                      commitTag();
                    }
                  }}
                  onBlur={commitTag}
                  placeholder="+ add…"
                />
              </span>
            )}
          </div>
        </div>

        {/* ── Highlights ── */}
        <div>
          <div className="mb-3 flex items-center justify-between">
            <p className="font-mono text-[9px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
              Highlights
            </p>
            {isEditing && (
              <button
                type="button"
                onClick={addHighlight}
                className="font-mono text-[9px] font-bold text-primary hover:underline"
              >
                + Add
              </button>
            )}
          </div>
          <div className="space-y-3">
            {data.highlights.map((h, i) => (
              <div key={i} className="group/hl flex gap-3">
                <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10">
                  <Icon icon="solar:star-bold" className="text-[10px] text-primary" />
                </div>
                <div className="min-w-0 flex-1">
                  {isEditing ? (
                    <>
                      <input
                        className={`${inlineField} font-mono text-xs font-bold`}
                        value={h.title}
                        onChange={(e) => setHighlight(i, { title: e.target.value })}
                        placeholder="Highlight title…"
                      />
                      <AutoTextarea
                        className={`${inlineField} mt-0.5 resize-none text-sm leading-relaxed text-foreground/70`}
                        value={h.description}
                        onChange={(v) => setHighlight(i, { description: v })}
                        placeholder="1–2 sentence description…"
                        minRows={2}
                      />
                    </>
                  ) : (
                    <>
                      <p className="font-mono text-xs font-bold">{h.title}</p>
                      <p className="mt-0.5 text-sm leading-relaxed text-foreground/70">{h.description}</p>
                    </>
                  )}
                </div>
                {isEditing && (
                  <button
                    type="button"
                    onClick={() => removeHighlight(i)}
                    className="mt-0.5 shrink-0 text-muted-foreground hover:text-destructive transition-colors"
                    aria-label="Remove highlight"
                  >
                    <Icon icon="solar:trash-bin-minimalistic-linear" className="text-sm" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* ── Impact ── */}
        <div className="rounded-xl border border-primary/20 bg-primary/5 px-5 py-4">
          <p className="mb-1 font-mono text-[9px] font-bold uppercase tracking-[0.2em] text-primary">
            Impact
          </p>
          {isEditing ? (
            <AutoTextarea
              className={`${inlineField} resize-none text-sm leading-relaxed text-foreground/80`}
              value={data.impact}
              onChange={(v) => set('impact', v)}
              placeholder="Measurable outcome…"
              minRows={2}
            />
          ) : (
            <p className="text-sm leading-relaxed text-foreground/80">{data.impact}</p>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Auto-growing textarea ────────────────────────────────────────────────────

function AutoTextarea({
  value,
  onChange,
  className,
  placeholder,
  minRows,
}: {
  value: string;
  onChange: (v: string) => void;
  className?: string;
  placeholder?: string;
  minRows: number;
}) {
  const ref = useRef<HTMLTextAreaElement>(null);

  const resize = () => {
    const el = ref.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${el.scrollHeight}px`;
  };

  return (
    <textarea
      ref={ref}
      className={className}
      rows={minRows}
      value={value}
      placeholder={placeholder}
      onChange={(e) => {
        onChange(e.target.value);
        resize();
      }}
      onFocus={resize}
    />
  );
}
