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

    const allowedOrigin = new URL(WEB_APP_URL).origin;

    const server = http.createServer((req, res) => {
      const requestOrigin = req.headers.origin ?? '';
      const originOk = requestOrigin === allowedOrigin;
      const corsHeaders: Record<string, string> = {
        'Access-Control-Allow-Origin': originOk ? requestOrigin : '',
        'Access-Control-Allow-Private-Network': 'true',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      };

      const url = new URL(req.url ?? '/', `http://localhost:${port}`);
      if (url.pathname !== '/callback') {
        res.writeHead(404).end();
        return;
      }

      // Preflight for Chrome's Private Network Access
      if (req.method === 'OPTIONS') {
        res.writeHead(204, corsHeaders).end();
        return;
      }

      if (!originOk) {
        res.writeHead(403).end();
        return;
      }

      if (req.method !== 'POST') {
        res.writeHead(405).end();
        return;
      }

      let body = '';
      req.on('data', (chunk: Buffer) => { body += chunk.toString(); });
      req.on('end', () => {
        let data: Record<string, unknown>;
        try {
          data = JSON.parse(body) as Record<string, unknown>;
        } catch {
          res.writeHead(400, corsHeaders).end();
          return;
        }

        const incomingState = typeof data.state === 'string' ? data.state : null;
        if (incomingState !== expectedState) {
          res.writeHead(400, corsHeaders).end();
          return;
        }

        const accessToken = typeof data.access_token === 'string' ? data.access_token : null;
        const refreshToken = typeof data.refresh_token === 'string' ? data.refresh_token : null;
        const expiresAt = typeof data.expires_at === 'number' ? data.expires_at : null;
        const userId = typeof data.user_id === 'string' ? data.user_id : null;
        const email = typeof data.email === 'string' ? data.email : '';
        const username = typeof data.username === 'string' ? data.username : '';

        if (accessToken && refreshToken && expiresAt && userId) {
          res.writeHead(200, corsHeaders).end();
          clearTimeout(timer);
          const session: SupabaseSession = {
            accessToken,
            refreshToken,
            expiresAt,
            user: { id: userId, email, githubUsername: username },
          };
          server.close(() => resolve(session));
          return;
        }

        res.writeHead(400, corsHeaders).end();
      });
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
