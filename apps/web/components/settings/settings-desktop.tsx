import { Icon } from '@iconify/react';

import type { SettingsFormProps } from './settings-types';

function Skeleton({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded bg-muted ${className ?? ''}`} />;
}

export function SettingsDesktop({ form, update, onToggleAllowContact, saved, onSave, saving, savingContact, loading }: SettingsFormProps) {
  if (loading) {
    return (
      <main className="mx-auto min-h-screen max-w-4xl px-6 py-10">
        <Skeleton className="mb-8 h-9 w-52" />
        <div className="grid gap-4 md:grid-cols-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className={`h-12 ${i === 4 ? 'md:col-span-2' : ''}`} />
          ))}
        </div>
        <Skeleton className="mt-6 h-14 w-full" />
        <Skeleton className="mt-6 h-10 w-36" />
      </main>
    );
  }

  return (
    <main className="mx-auto min-h-screen max-w-4xl px-6 py-10">
      <h1 className="mb-8 text-3xl font-bold">Identity Settings</h1>
      <div className="grid gap-4 md:grid-cols-2">
        <input
          value={form.name}
          onChange={(e) => update('name', e.target.value)}
          className="rounded border border-border bg-card px-4 py-3"
          placeholder="Full name"
        />
        <input
          value={form.email}
          onChange={(e) => update('email', e.target.value)}
          className="rounded border border-border bg-card px-4 py-3"
          placeholder="Email"
        />
        <input
          value={form.role}
          onChange={(e) => update('role', e.target.value)}
          className="rounded border border-border bg-card px-4 py-3"
          placeholder="Role"
        />
        <input
          value={form.location}
          onChange={(e) => update('location', e.target.value)}
          className="rounded border border-border bg-card px-4 py-3"
          placeholder="Location"
        />
        <input
          value={form.website}
          onChange={(e) => update('website', e.target.value)}
          className="md:col-span-2 rounded border border-border bg-card px-4 py-3"
          placeholder="Website"
        />
      </div>
      <div className="mt-6 flex items-center justify-between rounded border border-border bg-card px-4 py-3 md:col-span-2">
        <div>
          <p className="font-medium text-sm">Allow companies to contact me</p>
          <p className="text-xs text-muted-foreground">Your profile will appear in the talent directory and companies can send you messages.</p>
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
        className="mt-6 flex items-center gap-2 rounded bg-primary px-6 py-3 font-bold text-primary-foreground disabled:opacity-60 transition-opacity"
      >
        {saving && <Icon icon="solar:spinner-bold" className="animate-spin text-sm" />}
        {saving ? 'Saving…' : 'Save Changes'}
      </button>
      {saved ? (
        <p className={`mt-3 text-sm ${saved.startsWith('Save failed') ? 'text-destructive' : 'text-primary'}`}>{saved}</p>
      ) : null}
      <div className="mt-10 rounded border border-red-500/30 bg-red-500/10 p-6">
        <h3 className="font-semibold text-red-400">Danger Zone</h3>
        <p className="mb-4 text-sm text-muted-foreground">Delete account and generated assets.</p>
        <button type="button" className="rounded bg-red-500 px-4 py-2 text-white">
          Delete Account
        </button>
      </div>
    </main>
  );
}
