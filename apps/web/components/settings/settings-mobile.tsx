import type { SettingsFormProps } from './settings-types';

export function SettingsMobile({ form, update, saved, onSave }: SettingsFormProps) {
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
      <button
        type="button"
        onClick={onSave}
        className="mt-6 w-full rounded bg-cyan-400 py-4 font-bold text-black"
      >
        Push Changes
      </button>
      {saved ? <p className="mt-3 text-sm text-cyan-300">{saved}</p> : null}
    </main>
  );
}
