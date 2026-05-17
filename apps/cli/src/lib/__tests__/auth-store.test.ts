import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock secrets module
vi.mock('../secrets.js', () => {
  let stored: Record<string, unknown> = {};
  return {
    loadSecrets: vi.fn(async () => ({ ...stored })),
    saveSecrets: vi.fn(async (s: Record<string, unknown>) => {
      stored = { ...stored, ...s };
    }),
    parseSupabaseSession: vi.fn(),
  };
});

import { saveSession, getSession, clearSession } from '../auth-store.js';
import type { SupabaseSession } from '../secrets.js';
import { loadSecrets, saveSecrets } from '../secrets.js';

const SESSION: SupabaseSession = {
  accessToken: 'access-tok',
  refreshToken: 'refresh-tok',
  expiresAt: Math.floor(Date.now() / 1000) + 3600,
  user: { id: 'uid', email: 'a@b.com', githubUsername: 'devuser' },
};

describe('auth-store', () => {
  beforeEach(() => {
    vi.mocked(loadSecrets).mockResolvedValue({});
    vi.mocked(saveSecrets).mockResolvedValue();
  });

  it('saveSession calls saveSecrets with session', async () => {
    await saveSession(SESSION);
    expect(saveSecrets).toHaveBeenCalledWith({ supabaseSession: SESSION });
  });

  it('getSession returns null when no session stored', async () => {
    vi.mocked(loadSecrets).mockResolvedValue({});
    const s = await getSession();
    expect(s).toBeNull();
  });

  it('getSession returns valid non-expired session', async () => {
    vi.mocked(loadSecrets).mockResolvedValue({ supabaseSession: SESSION });
    const s = await getSession();
    expect(s?.accessToken).toBe('access-tok');
  });

  it('clearSession calls saveSecrets with undefined supabaseSession', async () => {
    await clearSession();
    expect(saveSecrets).toHaveBeenCalledWith({ supabaseSession: undefined });
  });
});
