
'use client';

import { useState } from 'react';

export default function MobileBuilderPage() {
  const [github, setGithub] = useState('');
  const [stack, setStack] = useState('Rust, K8s');
  const [role, setRole] = useState('Senior Engineer');
  const [status, setStatus] = useState('');

  const run = () => {
    if (!github) return setStatus('Connect GitHub first.');
    setStatus(`Engine started for ${role} (${stack})`);
  };

  return (
    <main className="min-h-screen max-w-md mx-auto border-x border-border p-5 pb-24">
      <h1 className="text-3xl font-bold mb-8">Generator</h1>
      <div className="space-y-4">
        <input value={github} onChange={(e) => setGithub(e.target.value)} placeholder="GitHub username" className="w-full rounded border border-border bg-card px-4 py-3" />
        <input value={stack} onChange={(e) => setStack(e.target.value)} className="w-full rounded border border-border bg-card px-4 py-3" />
        <input value={role} onChange={(e) => setRole(e.target.value)} className="w-full rounded border border-border bg-card px-4 py-3" />
        <button onClick={run} className="w-full py-4 bg-cyan-400 text-black font-bold rounded">Run Engine</button>
        {status && <p className="text-sm text-cyan-300">{status}</p>}
      </div>
    </main>
  );
}
