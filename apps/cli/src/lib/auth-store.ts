import { loadSecrets, saveSecrets } from './secrets.js';
import type { SupabaseSession } from './secrets.js';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from './supabase-config.js';

export type { SupabaseSession };

export async function saveSession(session: SupabaseSession): Promise<void> {
  await saveSecrets({ supabaseSession: session });
}

export async function clearSession(): Promise<void> {
  await saveSecrets({ supabaseSession: undefined });
}

export async function getSession(): Promise<SupabaseSession | null> {
  const secrets = await loadSecrets();
  const session = secrets.supabaseSession ?? null;
  if (!session) return null;

  if (Date.now() / 1000 >= session.expiresAt - 60) {
    try {
      const fresh = await refreshSupabaseToken(session.refreshToken);
      await saveSession(fresh);
      return fresh;
    } catch {
      await clearSession();
      return null;
    }
  }

  return session;
}

type SupabaseTokenResponse = {
  access_token: string;
  refresh_token: string;
  expires_at: number;
  user: {
    id: string;
    email?: string;
    user_metadata?: { user_name?: string; preferred_username?: string };
  };
};

async function refreshSupabaseToken(refreshToken: string): Promise<SupabaseSession> {
  const res = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=refresh_token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': SUPABASE_ANON_KEY,
    },
    body: JSON.stringify({ refresh_token: refreshToken }),
  });
  if (!res.ok) throw new Error(`Refresh failed (${res.status})`);
  return parseTokenResponse(await res.json() as SupabaseTokenResponse);
}

export function parseTokenResponse(data: SupabaseTokenResponse): SupabaseSession {
  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    expiresAt: data.expires_at,
    user: {
      id: data.user.id,
      email: data.user.email ?? '',
      githubUsername:
        data.user.user_metadata?.user_name ??
        data.user.user_metadata?.preferred_username ??
        '',
    },
  };
}
