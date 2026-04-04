import type { SettingsFormProps } from './settings-types';

export function SettingsTablet({ form, update, saved, onSave }: SettingsFormProps) {
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
      <button
        type="button"
        onClick={onSave}
        className="mt-8 w-full rounded-lg bg-primary py-4 font-home-mono text-xs font-bold uppercase tracking-widest text-primary-foreground sm:w-auto sm:px-12"
      >
        Save changes
      </button>
      {saved ? <p className="mt-4 text-sm text-primary">{saved}</p> : null}
    </main>
  );
}
