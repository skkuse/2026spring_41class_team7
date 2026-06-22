import { Icon } from '@iconify/react';

import type { SettingsFormProps } from './settings-types';

function Skeleton({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded bg-muted ${className ?? ''}`} />;
}

export function SettingsMobile({ form, update, onToggleAllowContact, saved, onSave, saving, savingContact, loading }: SettingsFormProps) {
  if (loading) {
    return (
      <main className="mx-auto min-h-screen max-w-md border-x border-border p-5 pb-nav-safe">
        <Skeleton className="mb-6 h-8 w-40" />
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
        </div>
        <Skeleton className="mt-4 h-14 w-full" />
        <Skeleton className="mt-6 h-12 w-full" />
      </main>
    );
  }

  return (
    <main className="mx-auto min-h-screen max-w-md border-x border-border p-5 pb-nav-safe">
      <h1 className="mb-6 text-2xl font-black">Edit Identity</h1>
      <div className="space-y-3">
        <input
          value={form.name}
          onChange={(e) => update('name', e.target.value)}
          className="w-full rounded border border-border bg-card px-4 py-3"
        />
        <input
          value={form.email}
          onChange={(e) => update('email', e.target.value)}
          className="w-full rounded border border-border bg-card px-4 py-3"
        />
        <input
          value={form.role}
          onChange={(e) => update('role', e.target.value)}
          className="w-full rounded border border-border bg-card px-4 py-3"
        />
        <input
          value={form.location}
          onChange={(e) => update('location', e.target.value)}
          className="w-full rounded border border-border bg-card px-4 py-3"
        />
      </div>
      <div className="mt-4 flex items-center justify-between rounded border border-border bg-card px-4 py-3">
        <div>
          <p className="font-medium text-sm">Allow companies to contact me</p>
          <p className="text-xs text-muted-foreground">Appear in the talent directory.</p>
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
        className="mt-6 flex w-full items-center justify-center gap-2 rounded bg-primary py-4 font-bold text-primary-foreground disabled:opacity-60"
      >
        {saving && <Icon icon="solar:spinner-bold" className="animate-spin text-sm" />}
        {saving ? 'Saving…' : 'Save Changes'}
      </button>
      {saved ? <p className={`mt-3 text-sm ${saved.startsWith('Save failed') ? 'text-destructive' : 'text-primary'}`}>{saved}</p> : null}
    </main>
  );
}
