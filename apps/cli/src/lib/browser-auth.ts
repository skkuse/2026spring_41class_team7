import http from 'node:http';
import { exec } from 'node:child_process';
import { generatePKCE } from './pkce.js';
import { parseTokenResponse } from './auth-store.js';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from './supabase-config.js';
import type { SupabaseSession } from './secrets.js';

const TIMEOUT_MS = 5 * 60 * 1000; // 5 minutes

export type OAuthResult =
  | { ok: true; session: SupabaseSession }
  | { ok: false; error: string };

export async function runOAuthFlow(
  onUrl?: (url: string) => void,
): Promise<OAuthResult> {
  const { verifier, challenge } = generatePKCE();
  const port = await findFreePort();
  const redirectTo = `http://localhost:${port}/callback`;

  const authUrl = new URL(`${SUPABASE_URL}/auth/v1/authorize`);
  authUrl.searchParams.set('provider', 'github');
  authUrl.searchParams.set('code_challenge', challenge);
  authUrl.searchParams.set('code_challenge_method', 'S256');
  authUrl.searchParams.set('redirect_to', redirectTo);

  const urlStr = authUrl.toString();
  onUrl?.(urlStr);
  openBrowser(urlStr);

  try {
    const code = await waitForCallback(port);
    const session = await exchangeCode(code, verifier, redirectTo);
    return { ok: true, session };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) };
  }
}

function findFreePort(): Promise<number> {
  return new Promise((resolve, reject) => {
    const srv = http.createServer();
    srv.listen(0, () => {
      const addr = srv.address() as { port: number };
      srv.close(() => resolve(addr.port));
    });
    srv.on('error', reject);
  });
}

function openBrowser(url: string): void {
  const cmd =
    process.platform === 'win32'
      ? `start "" "${url}"`
      : process.platform === 'darwin'
        ? `open "${url}"`
        : `xdg-open "${url}"`;
  exec(cmd, () => {
    // ignore errors — caller prints URL as fallback
  });
}

function waitForCallback(port: number): Promise<string> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      server.close();
      reject(new Error('Login timed out after 5 minutes.'));
    }, TIMEOUT_MS);

    const server = http.createServer((req, res) => {
      const url = new URL(req.url ?? '/', `http://localhost:${port}`);
      if (url.pathname !== '/callback') {
        res.writeHead(404).end();
        return;
      }

      const error = url.searchParams.get('error');
      const code = url.searchParams.get('code');

      if (error) {
        const desc = url.searchParams.get('error_description') ?? error;
        res.writeHead(200, { 'Content-Type': 'text/html' }).end(
          `<html><body><h2>Login failed: ${desc}</h2><p>You can close this tab.</p></body></html>`,
        );
        clearTimeout(timer);
        server.close(() => reject(new Error(`OAuth error: ${desc}`)));
        return;
      }

      if (code) {
        res.writeHead(200, { 'Content-Type': 'text/html' }).end(
          `<html><body><h2>Logged in! You can close this tab.</h2></body></html>`,
        );
        clearTimeout(timer);
        server.close(() => resolve(code));
      }
    });

    server.listen(port);
    server.on('error', (e) => {
      clearTimeout(timer);
      reject(e);
    });
  });
}

async function exchangeCode(
  code: string,
  verifier: string,
  redirectUri: string,
): Promise<SupabaseSession> {
  const res = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=pkce`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      apikey: SUPABASE_ANON_KEY,
    },
    body: JSON.stringify({
      auth_code: code,
      code_verifier: verifier,
      redirect_uri: redirectUri,
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Token exchange failed (${res.status}): ${body}`);
  }

  return parseTokenResponse(
    await res.json() as Parameters<typeof parseTokenResponse>[0],
  );
}
