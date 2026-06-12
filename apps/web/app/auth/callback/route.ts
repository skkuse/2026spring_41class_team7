import { NextResponse } from 'next/server';

import { createServerSupabase } from '../../../lib/supabase/server';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:3001';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const cliPort = searchParams.get('cli_port');
  const cliState = searchParams.get('state');
  const nextPath = searchParams.get('next') ?? '/home';

  if (code) {
    const supabase = await createServerSupabase();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error && data.session) {
      await fetch(`${API_BASE}/v1/bootstrap`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${data.session.access_token}`,
        },
      }).catch(() => { /* non-fatal */ });

      if (cliPort && /^\d{1,5}$/.test(cliPort) && cliState && /^[0-9a-f]{32}$/.test(cliState)) {
        const session = data.session;
        const user = session.user;
        const callbackUrl = new URL(`http://localhost:${cliPort}/callback`);
        callbackUrl.searchParams.set('state', cliState);
        callbackUrl.searchParams.set('access_token', session.access_token);
        callbackUrl.searchParams.set('refresh_token', session.refresh_token);
        callbackUrl.searchParams.set(
          'expires_at',
          String(session.expires_at ?? Math.floor(Date.now() / 1000) + session.expires_in),
        );
        callbackUrl.searchParams.set('user_id', user.id);
        callbackUrl.searchParams.set('email', user.email ?? '');
        callbackUrl.searchParams.set(
          'username',
          (user.user_metadata?.user_name as string | undefined) ??
          (user.user_metadata?.preferred_username as string | undefined) ??
          '',
        );
        return NextResponse.redirect(callbackUrl.toString());
      }

      return NextResponse.redirect(`${origin}${nextPath}`);
    }
  }

  return NextResponse.redirect(`${origin}/onboarding?error=auth`);
}
