import type { SettingsFormProps } from './settings-types';

export function SettingsDesktop({ form, update, saved, onSave }: SettingsFormProps) {
  return (
    <main className="mx-auto min-h-screen max-w-4xl p-6 md:p-10">
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
      <button
        type="button"
        onClick={onSave}
        className="mt-6 rounded bg-cyan-400 px-6 py-3 font-bold text-black"
      >
        Save Changes
      </button>
      {saved ? <p className="mt-3 text-sm text-cyan-300">{saved}</p> : null}
      <div className="mt-10 rounded border border-red-500/30 bg-red-500/10 p-6">
        <h3 className="font-semibold text-red-400">Danger Zone</h3>
        <p className="mb-4 text-sm text-zinc-300">Delete account and generated assets.</p>
        <button type="button" className="rounded bg-red-500 px-4 py-2 text-white">
          Delete Account
        </button>
      </div>
    </main>
  );
}
