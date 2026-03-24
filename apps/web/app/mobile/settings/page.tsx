
'use client';

import { useState } from 'react';
import { profile } from '../../../lib/mock-data';

export default function MobileSettingsPage() {
  const [name, setName] = useState(profile.name);
  const [email, setEmail] = useState(profile.email);
  const [role, setRole] = useState(profile.role);
  const [location, setLocation] = useState(profile.location);
  const [saved, setSaved] = useState('');

  return (
    <main className="min-h-screen max-w-md mx-auto border-x border-border p-5 pb-24">
      <h1 className="text-2xl font-black mb-6">Edit Identity</h1>
      <div className="space-y-3">
        <input value={name} onChange={(e) => setName(e.target.value)} className="w-full rounded border border-border bg-card px-4 py-3" />
        <input value={email} onChange={(e) => setEmail(e.target.value)} className="w-full rounded border border-border bg-card px-4 py-3" />
        <input value={role} onChange={(e) => setRole(e.target.value)} className="w-full rounded border border-border bg-card px-4 py-3" />
        <input value={location} onChange={(e) => setLocation(e.target.value)} className="w-full rounded border border-border bg-card px-4 py-3" />
      </div>
      <button onClick={() => setSaved('Changes pushed successfully')} className="w-full mt-6 py-4 bg-cyan-400 text-black rounded font-bold">Push Changes</button>
      {saved && <p className="mt-3 text-sm text-cyan-300">{saved}</p>}
    </main>
  );
}
