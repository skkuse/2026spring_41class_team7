
'use client';

import { useState } from 'react';
import { profile } from '../../lib/mock-data';

export default function SettingsPage() {
  const [form, setForm] = useState(profile);
  const [saved, setSaved] = useState('');

  const update = (key: keyof typeof profile, value: string) => setForm((f) => ({ ...f, [key]: value }));
  const submit = () => setSaved(`Saved ${form.name} at ${new Date().toLocaleTimeString()}`);

  return (
    <main className="min-h-screen p-6 md:p-10 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Identity Settings</h1>
      <div className="grid md:grid-cols-2 gap-4">
        <input value={form.name} onChange={(e) => update('name', e.target.value)} className="rounded border border-border bg-card px-4 py-3" placeholder="Full name" />
        <input value={form.email} onChange={(e) => update('email', e.target.value)} className="rounded border border-border bg-card px-4 py-3" placeholder="Email" />
        <input value={form.role} onChange={(e) => update('role', e.target.value)} className="rounded border border-border bg-card px-4 py-3" placeholder="Role" />
        <input value={form.location} onChange={(e) => update('location', e.target.value)} className="rounded border border-border bg-card px-4 py-3" placeholder="Location" />
      </div>
      <button onClick={submit} className="mt-6 px-6 py-3 bg-cyan-400 text-black rounded font-bold">Save Changes</button>
      {saved && <p className="mt-3 text-sm text-cyan-300">{saved}</p>}
      <div className="mt-10 border border-red-500/30 bg-red-500/10 rounded p-6">
        <h3 className="text-red-400 font-semibold">Danger Zone</h3>
        <p className="text-sm text-zinc-300 mb-4">Delete account and generated assets.</p>
        <button className="px-4 py-2 rounded bg-red-500 text-white">Delete Account</button>
      </div>
    </main>
  );
}
