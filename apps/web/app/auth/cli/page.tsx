import { redirect } from 'next/navigation';
import { createServerSupabase } from '../../../lib/supabase/server';

type SearchParams = Promise<{ cli_port?: string; state?: string }>;

export default async function CliAuthPage({ searchParams }: { searchParams: SearchParams }) {
  const { cli_port: cliPort, state } = await searchParams;

  if (!cliPort || !/^\d{1,5}$/.test(cliPort) || !state || !/^[0-9a-f]{32}$/.test(state)) {
    redirect('/onboarding');
  }

  const supabase = await createServerSupabase();
  const { data: { session } } = await supabase.auth.getSession();

  if (session) {
    const url = new URL(`http://localhost:${cliPort}/callback`);
    url.searchParams.set('state', state);
    url.searchParams.set('access_token', session.access_token);
    url.searchParams.set('refresh_token', session.refresh_token);
    url.searchParams.set(
      'expires_at',
      String(session.expires_at ?? Math.floor(Date.now() / 1000) + session.expires_in),
    );
    url.searchParams.set('user_id', session.user.id);
    url.searchParams.set('email', session.user.email ?? '');
    url.searchParams.set(
      'username',
      (session.user.user_metadata?.user_name as string | undefined) ??
      (session.user.user_metadata?.preferred_username as string | undefined) ??
      '',
    );
    redirect(url.toString());
  }

  redirect(`/auth/cli-oauth?cli_port=${cliPort}&state=${state}`);
}
