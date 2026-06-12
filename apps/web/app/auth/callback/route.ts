import { NextResponse } from 'next/server';

import { createServerSupabase } from '../../../lib/supabase/server';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:3001';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const cliPort = searchParams.get('cli_port');
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

      const cliState = searchParams.get('state');
      if (cliPort && /^\d{1,5}$/.test(cliPort) && cliState && /^[0-9a-f]{32}$/.test(cliState)) {
        const session = data.session;
        const user = session.user;
        const doneUrl = new URL(`${origin}/auth/cli-done`);
        doneUrl.searchParams.set('cli_port', cliPort);
        doneUrl.searchParams.set('state', cliState);
        doneUrl.searchParams.set('access_token', session.access_token);
        doneUrl.searchParams.set('refresh_token', session.refresh_token);
        doneUrl.searchParams.set(
          'expires_at',
          String(session.expires_at ?? Math.floor(Date.now() / 1000) + session.expires_in),
        );
        doneUrl.searchParams.set('user_id', user.id);
        doneUrl.searchParams.set('email', user.email ?? '');
        doneUrl.searchParams.set(
          'username',
          (user.user_metadata?.user_name as string | undefined) ??
          (user.user_metadata?.preferred_username as string | undefined) ??
          '',
        );
        return NextResponse.redirect(doneUrl.toString());
      }

      return NextResponse.redirect(`${origin}${nextPath}`);
    }
  }

  return NextResponse.redirect(`${origin}/onboarding?error=auth`);
}
