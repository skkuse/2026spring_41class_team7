import { Icon } from '@iconify/react';

import type { SettingsFormProps } from './settings-types';

function Skeleton({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded bg-muted ${className ?? ''}`} />;
}

export function SettingsTablet({ form, update, onToggleAllowContact, saved, onSave, saving, savingContact, loading }: SettingsFormProps) {
  if (loading) {
    return (
      <main className="mx-auto min-h-screen max-w-2xl border-x border-border px-8 py-10 pb-nav-safe">
        <Skeleton className="mb-2 h-7 w-48" />
        <Skeleton className="mb-8 h-4 w-72" />
        <div className="grid gap-4 sm:grid-cols-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className={`h-12 ${i === 4 ? 'sm:col-span-2' : ''}`} />
          ))}
        </div>
        <Skeleton className="mt-6 h-14 w-full" />
        <Skeleton className="mt-8 h-12 w-full sm:w-48" />
      </main>
    );
  }

  return (
    <main className="mx-auto min-h-screen max-w-2xl border-x border-border px-8 py-10 pb-nav-safe">
      <h1 className="mb-2 font-home-heading text-2xl font-bold uppercase tracking-tight">
        Edit Identity
      </h1>
      <p className="mb-8 font-home-mono text-sm text-muted-foreground">
        Profile fields sync to your public preview when published.
      </p>
      <div className="grid gap-4 sm:grid-cols-2">
        <input
          value={form.name}
          onChange={(e) => update('name', e.target.value)}
          placeholder="Full name"
          className="w-full rounded-lg border border-border bg-card px-4 py-3"
        />
        <input
          value={form.email}
          onChange={(e) => update('email', e.target.value)}
          placeholder="Email"
          className="w-full rounded-lg border border-border bg-card px-4 py-3"
        />
        <input
          value={form.role}
          onChange={(e) => update('role', e.target.value)}
          placeholder="Role"
          className="w-full rounded-lg border border-border bg-card px-4 py-3"
        />
        <input
          value={form.location}
          onChange={(e) => update('location', e.target.value)}
          placeholder="Location"
          className="w-full rounded-lg border border-border bg-card px-4 py-3"
        />
        <input
          value={form.website}
          onChange={(e) => update('website', e.target.value)}
          placeholder="Website"
          className="sm:col-span-2 w-full rounded-lg border border-border bg-card px-4 py-3"
        />
      </div>
      <div className="mt-6 flex items-center justify-between rounded-lg border border-border bg-card px-4 py-3">
        <div>
          <p className="font-medium text-sm">Allow companies to contact me</p>
          <p className="text-xs text-muted-foreground">Appear in the talent directory and receive messages from companies.</p>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={form.allowContact}
          disabled={savingContact}
          onClick={() => onToggleAllowContact(!form.allowContact)}
          className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus:outline-none disabled:opacity-60 ${form.allowContact ? 'bg-primary' : 'bg-muted'}`}
        >
          {savingContact ? (
            <Icon icon="solar:spinner-bold" className="absolute inset-0 m-auto animate-spin text-xs text-white" />
          ) : (
            <span className={`pointer-events-none inline-block size-5 rounded-full bg-white shadow transform transition-transform ${form.allowContact ? 'translate-x-5' : 'translate-x-0'}`} />
          )}
        </button>
      </div>
      <button
        type="button"
        onClick={onSave}
        disabled={saving}
        className="mt-8 flex items-center gap-2 w-full justify-center rounded-lg bg-primary py-4 font-home-mono text-xs font-bold uppercase tracking-widest text-primary-foreground disabled:opacity-60 sm:w-auto sm:px-12"
      >
        {saving && <Icon icon="solar:spinner-bold" className="animate-spin text-sm" />}
        {saving ? 'Saving…' : 'Save changes'}
      </button>
      {saved ? <p className={`mt-4 text-sm ${saved.startsWith('Save failed') ? 'text-destructive' : 'text-primary'}`}>{saved}</p> : null}
    </main>
  );
}
