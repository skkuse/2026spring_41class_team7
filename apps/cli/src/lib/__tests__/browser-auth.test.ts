import http from 'node:http';
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Prevent actual browser from opening during tests
vi.mock('node:child_process', () => ({ exec: vi.fn() }));

import { runOAuthFlow } from '../browser-auth.js';

const ORIGIN = 'https://www.jobclaw.fyi';

const FAKE_TOKENS = {
  access_token: 'test-access-token',
  refresh_token: 'test-refresh-token',
  expires_at: Math.floor(Date.now() / 1000) + 3600,
  user_id: 'user-123',
  email: 'dev@example.com',
  username: 'devuser',
};

/** Start the OAuth flow and wait until the local server is listening. */
async function startFlow() {
  let resolveUrl!: (url: string) => void;
  const urlReady = new Promise<string>((r) => { resolveUrl = r; });
  const flowPromise = runOAuthFlow((url) => resolveUrl(url));
  const capturedUrl = await urlReady;
  const parsed = new URL(capturedUrl);
  const port = parsed.searchParams.get('cli_port')!;
  const state = parsed.searchParams.get('state')!;
  return { flowPromise, port, state };
}

/** POST JSON to the CLI callback server. */
function postCallback(port: string, body: Record<string, unknown>, origin = ORIGIN) {
  return fetch(`http://localhost:${port}/callback`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Origin: origin },
    body: JSON.stringify(body),
  });
}

/** GET the CLI callback server (simulates server-side redirect from web app). */
function getCallback(port: string, params: Record<string, string | number>) {
  const url = new URL(`http://localhost:${port}/callback`);
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, String(v));
  return fetch(url.toString(), { method: 'GET', redirect: 'manual' });
}

/** Close a flow cleanly by sending valid tokens after a bad-request test. */
async function closeFlow(port: string, state: string, flowPromise: ReturnType<typeof runOAuthFlow>) {
  await postCallback(port, { ...FAKE_TOKENS, state });
  await flowPromise;
}

/** Close a flow via the GET path. */
async function closeFlowGet(port: string, state: string, flowPromise: ReturnType<typeof runOAuthFlow>) {
  await getCallback(port, { ...FAKE_TOKENS, state });
  await flowPromise;
}

describe('runOAuthFlow – local callback server', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('resolves with session when browser POSTs valid tokens', async () => {
    const { flowPromise, port, state } = await startFlow();

    const res = await postCallback(port, { ...FAKE_TOKENS, state });
    expect(res.status).toBe(200);

    const result = await flowPromise;
    expect(result.ok).toBe(true);
    if (!result.ok) throw new Error('Expected ok');

    expect(result.session.accessToken).toBe('test-access-token');
    expect(result.session.refreshToken).toBe('test-refresh-token');
    expect(result.session.user.email).toBe('dev@example.com');
    expect(result.session.user.githubUsername).toBe('devuser');
    expect(result.session.user.id).toBe('user-123');
  });

  it('returns 400 when state does not match', async () => {
    const { flowPromise, port, state } = await startFlow();

    const res = await postCallback(port, { ...FAKE_TOKENS, state: 'wrong-state-aabbccdd11223344' });
    expect(res.status).toBe(400);

    await closeFlow(port, state, flowPromise);
  });

  it('returns 403 when Origin header is not the web app', async () => {
    const { flowPromise, port, state } = await startFlow();

    const res = await postCallback(port, { ...FAKE_TOKENS, state }, 'https://evil.com');
    expect(res.status).toBe(403);

    await closeFlow(port, state, flowPromise);
  });

  it('returns 400 when required token fields are missing', async () => {
    const { flowPromise, port, state } = await startFlow();

    // Missing access_token
    const res = await postCallback(port, { state, refresh_token: 'r', expires_at: 9999, user_id: 'u' });
    expect(res.status).toBe(400);

    await closeFlow(port, state, flowPromise);
  });

  it('returns 404 for paths other than /callback', async () => {
    const { flowPromise, port, state } = await startFlow();

    const res = await fetch(`http://localhost:${port}/other`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Origin: ORIGIN },
      body: JSON.stringify({ ...FAKE_TOKENS, state }),
    });
    expect(res.status).toBe(404);

    await closeFlow(port, state, flowPromise);
  });

  it('returns 405 for non-POST methods (e.g. PUT)', async () => {
    const { flowPromise, port, state } = await startFlow();

    // Use node:http directly — fetch treats Origin as a forbidden header and strips it,
    // which would trigger the origin check (403) before the method check (405).
    const status = await new Promise<number>((resolve, reject) => {
      const req = http.request(
        { method: 'PUT', hostname: 'localhost', port: Number(port), path: '/callback',
          headers: { Origin: ORIGIN, 'Content-Type': 'application/json' } },
        (res) => resolve(res.statusCode ?? 0),
      );
      req.on('error', reject);
      req.end();
    });
    expect(status).toBe(405);

    await closeFlow(port, state, flowPromise);
  });

  it('handles OPTIONS preflight with 204 and CORS headers', async () => {
    const { flowPromise, port, state } = await startFlow();

    const res = await fetch(`http://localhost:${port}/callback`, {
      method: 'OPTIONS',
      headers: { Origin: ORIGIN },
    });
    expect(res.status).toBe(204);
    expect(res.headers.get('access-control-allow-methods')).toContain('POST');

    await closeFlow(port, state, flowPromise);
  });

  it('generates a unique state per flow call', async () => {
    const urls: string[] = [];
    const flows = await Promise.all([
      (async () => {
        let r!: (u: string) => void;
        const p = new Promise<string>((res) => { r = res; });
        const f = runOAuthFlow((u) => r(u));
        return { url: await p, flow: f };
      })(),
      (async () => {
        let r!: (u: string) => void;
        const p = new Promise<string>((res) => { r = res; });
        const f = runOAuthFlow((u) => r(u));
        return { url: await p, flow: f };
      })(),
    ]);

    const states = flows.map(({ url }) => new URL(url).searchParams.get('state')!);
    expect(states[0]).not.toBe(states[1]);

    // Close both flows
    for (const { url, flow } of flows) {
      const port = new URL(url).searchParams.get('cli_port')!;
      const state = new URL(url).searchParams.get('state')!;
      await postCallback(port, { ...FAKE_TOKENS, state });
      await flow;
    }
  });
});

describe('runOAuthFlow – GET callback (server-side redirect path)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('resolves with session when web server GETs with valid tokens', async () => {
    const { flowPromise, port, state } = await startFlow();

    const res = await getCallback(port, { ...FAKE_TOKENS, state });
    expect(res.status).toBe(200);
    expect(res.headers.get('content-type')).toContain('text/html');

    const result = await flowPromise;
    expect(result.ok).toBe(true);
    if (!result.ok) throw new Error('Expected ok');
    expect(result.session.accessToken).toBe('test-access-token');
    expect(result.session.refreshToken).toBe('test-refresh-token');
    expect(result.session.user.email).toBe('dev@example.com');
    expect(result.session.user.githubUsername).toBe('devuser');
    expect(result.session.user.id).toBe('user-123');
  });

  it('returns 400 when state does not match on GET', async () => {
    const { flowPromise, port, state } = await startFlow();

    const res = await getCallback(port, { ...FAKE_TOKENS, state: 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa' });
    expect(res.status).toBe(400);

    await closeFlowGet(port, state, flowPromise);
  });

  it('returns 400 when access_token is missing on GET', async () => {
    const { flowPromise, port, state } = await startFlow();

    const { access_token: _drop, ...withoutAccess } = FAKE_TOKENS;
    const res = await getCallback(port, { ...withoutAccess, state });
    expect(res.status).toBe(400);

    await closeFlowGet(port, state, flowPromise);
  });

  it('returns 400 when refresh_token is missing on GET', async () => {
    const { flowPromise, port, state } = await startFlow();

    const { refresh_token: _drop, ...withoutRefresh } = FAKE_TOKENS;
    const res = await getCallback(port, { ...withoutRefresh, state });
    expect(res.status).toBe(400);

    await closeFlowGet(port, state, flowPromise);
  });

  it('returns 400 when user_id is missing on GET', async () => {
    const { flowPromise, port, state } = await startFlow();

    const { user_id: _drop, ...withoutUserId } = FAKE_TOKENS;
    const res = await getCallback(port, { ...withoutUserId, state });
    expect(res.status).toBe(400);

    await closeFlowGet(port, state, flowPromise);
  });

  it('returns 400 when expires_at is missing on GET', async () => {
    const { flowPromise, port, state } = await startFlow();

    const { expires_at: _drop, ...withoutExpiry } = FAKE_TOKENS;
    const res = await getCallback(port, { ...withoutExpiry, state });
    expect(res.status).toBe(400);

    await closeFlowGet(port, state, flowPromise);
  });

  it('returns 404 for GET to paths other than /callback', async () => {
    const { flowPromise, port, state } = await startFlow();

    const res = await fetch(`http://localhost:${port}/other?state=${state}`);
    expect(res.status).toBe(404);

    await closeFlowGet(port, state, flowPromise);
  });

  it('responds with success HTML on GET completion', async () => {
    const { flowPromise, port, state } = await startFlow();

    const res = await getCallback(port, { ...FAKE_TOKENS, state });
    const html = await res.text();
    expect(html).toContain('close this tab');

    await flowPromise;
  });
});
