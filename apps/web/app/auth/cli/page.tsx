'use client';

import { Suspense, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { createBrowserSupabase } from '../../../lib/supabase/client';

function CliAuthInner() {
  const searchParams = useSearchParams();
  const cliPort = searchParams.get('cli_port');
  const state = searchParams.get('state');

  useEffect(() => {
    if (!cliPort || !/^\d{1,5}$/.test(cliPort)) return;
    if (!state || !/^[0-9a-f]{32}$/.test(state)) return;
    const supabase = createBrowserSupabase();
    void supabase.auth.signInWithOAuth({
      provider: 'github',
      options: {
        redirectTo: `${window.location.origin}/auth/callback?cli_port=${cliPort}&state=${state}`,
      },
    });
  }, [cliPort, state]);

  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h2>Signing in to jobclaw CLI…</h2>
      <p>Redirecting to GitHub. You can close this tab once your terminal shows success.</p>
    </div>
  );
}

export default function CliAuthPage() {
  return (
    <Suspense>
      <CliAuthInner />
    </Suspense>
  );
}
