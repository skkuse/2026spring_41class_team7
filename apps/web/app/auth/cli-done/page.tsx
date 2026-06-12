'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';

function CliDoneInner() {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'sending' | 'ok' | 'error'>('sending');

  useEffect(() => {
    const cliPort = searchParams.get('cli_port');
    const state = searchParams.get('state');
    const accessToken = searchParams.get('access_token');
    const refreshToken = searchParams.get('refresh_token');
    const expiresAt = searchParams.get('expires_at');
    const userId = searchParams.get('user_id');
    const email = searchParams.get('email') ?? '';
    const username = searchParams.get('username') ?? '';

    if (!cliPort || !state || !accessToken || !refreshToken || !expiresAt || !userId) {
      setStatus('error');
      return;
    }

    fetch(`http://localhost:${cliPort}/callback`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ state, access_token: accessToken, refresh_token: refreshToken, expires_at: Number(expiresAt), user_id: userId, email, username }),
    })
      .then(() => setStatus('ok'))
      .catch(() => setStatus('error'));
  }, [searchParams]);

  if (status === 'sending') {
    return (
      <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
        <h2>Completing login…</h2>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
        <h2>Something went wrong</h2>
        <p>Could not reach the jobclaw CLI. Make sure it is still running and try again.</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h2>Logged in! You can close this tab.</h2>
      <p>Return to your terminal to continue.</p>
    </div>
  );
}

export default function CliDonePage() {
  return (
    <Suspense>
      <CliDoneInner />
    </Suspense>
  );
}
