
'use client';

import { useState } from 'react';

export default function OnboardingPage() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const submit = () => {
    if (!email.includes('@')) {
      setMessage('Enter a valid work email.');
      return;
    }
    setMessage(`Magic link sent to ${email}`);
  };

  return (
    <main className="min-h-screen bg-background text-foreground flex items-center justify-center p-6">
      <div className="w-full max-w-md border border-border bg-card rounded-3xl p-8">
        <h1 className="text-3xl font-bold mb-2">Claim your technical identity</h1>
        <p className="text-muted-foreground mb-6">Continue with provider or work email.</p>
        <div className="space-y-3">
          <button className="w-full h-12 bg-white text-black rounded-xl font-semibold">Continue with Google</button>
          <button className="w-full h-12 bg-[#0077B5] text-white rounded-xl font-semibold">Continue with LinkedIn</button>
          <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Work email" className="w-full h-12 rounded-xl border border-border bg-black/30 px-4" />
          <button onClick={submit} className="w-full h-12 rounded-xl border border-border bg-secondary">Continue with Email</button>
        </div>
        {message && <p className="mt-4 text-sm text-cyan-300">{message}</p>}
      </div>
    </main>
  );
}
