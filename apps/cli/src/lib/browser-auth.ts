import http from 'node:http';
import { exec } from 'node:child_process';
import { randomBytes } from 'node:crypto';
import { WEB_APP_URL } from './supabase-config.js';
import type { SupabaseSession } from './secrets.js';

const TIMEOUT_MS = 5 * 60 * 1000; // 5 minutes

export type OAuthResult =
  | { ok: true; session: SupabaseSession }
  | { ok: false; error: string };

export async function runOAuthFlow(
  onUrl?: (url: string) => void,
): Promise<OAuthResult> {
  const port = await findFreePort();
  const state = randomBytes(16).toString('hex');
  const urlStr = `${WEB_APP_URL}/auth/cli?cli_port=${port}&state=${state}`;

  try {
    const session = await waitForCallback(port, state, () => {
      onUrl?.(urlStr);
      openBrowser(urlStr);
    });
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

function waitForCallback(port: number, expectedState: string, onListening: () => void): Promise<SupabaseSession> {
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
      if (error) {
        const desc = url.searchParams.get('error_description') ?? error;
        res.writeHead(200, { 'Content-Type': 'text/html' }).end(
          `<html><body><h2>Login failed: ${desc}</h2><p>You can close this tab.</p></body></html>`,
        );
        clearTimeout(timer);
        server.close(() => reject(new Error(`OAuth error: ${desc}`)));
        return;
      }

      const incomingState = url.searchParams.get('state');
      if (incomingState !== expectedState) {
        res.writeHead(400).end();
        return;
      }

      const accessToken = url.searchParams.get('access_token');
      const refreshToken = url.searchParams.get('refresh_token');
      const expiresAt = url.searchParams.get('expires_at');
      const userId = url.searchParams.get('user_id');
      const email = url.searchParams.get('email') ?? '';
      const username = url.searchParams.get('username') ?? '';

      if (accessToken && refreshToken && expiresAt && userId) {
        res.writeHead(200, { 'Content-Type': 'text/html' }).end(
          `<html><body><h2>Logged in! You can close this tab.</h2></body></html>`,
        );
        clearTimeout(timer);
        const session: SupabaseSession = {
          accessToken,
          refreshToken,
          expiresAt: Number(expiresAt),
          user: { id: userId, email, githubUsername: username },
        };
        server.close(() => resolve(session));
        return;
      }

      res.writeHead(400).end();
    });

    server.listen(port, () => {
      onListening();
    });
    server.on('error', (e) => {
      clearTimeout(timer);
      reject(e);
    });
  });
}
