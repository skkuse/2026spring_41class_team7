'use client';

import { Suspense, useEffect, useState } from 'react';

function CliDoneInner() {
  const [status, setStatus] = useState<'sending' | 'ok' | 'error'>('sending');

  useEffect(() => {
    // Tokens arrive in the URL fragment — never sent to the server
    const params = new URLSearchParams(window.location.hash.slice(1));
    // Scrub tokens from browser history immediately
    history.replaceState(null, '', window.location.pathname);

    const cliPort = params.get('cli_port');
    const state = params.get('state');
    const accessToken = params.get('access_token');
    const refreshToken = params.get('refresh_token');
    const expiresAt = params.get('expires_at');
    const userId = params.get('user_id');
    const email = params.get('email') ?? '';
    const username = params.get('username') ?? '';

    if (!cliPort || !state || !accessToken || !refreshToken || !expiresAt || !userId) {
      setStatus('error');
      return;
    }

    fetch(`http://localhost:${cliPort}/callback`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        state,
        access_token: accessToken,
        refresh_token: refreshToken,
        expires_at: Number(expiresAt),
        user_id: userId,
        email,
        username,
      }),
    })
      .then(() => setStatus('ok'))
      .catch(() => setStatus('error'));
  }, []);

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
