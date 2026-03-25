/**
 * Call POST /v1/resume/parse against a running local API (pnpm --filter api dev).
 *
 * Prerequisites:
 *   - API on http://localhost:3001 (or set API_BASE_URL)
 *   - apps/api/.env with OPENAI_API_KEY, SUPABASE_URL, SUPABASE_ANON_KEY
 *   - TEST_BEARER_TOKEN = Supabase session access_token (same as the web app sends)
 *
 * Resume file resolution (first path that exists wins):
 *   1. RESUME_PDF_PATH
 *   2. First CLI argument
 *   3. WSL: /mnt/c/Users/hskan/Downloads/resume.pdf  (your C:\Users\hskan\Downloads\resume.pdf)
 *   4. Windows Node: C:\Users\hskan\Downloads\resume.pdf
 *   5. apps/api/test/fixtures/user-resume.pdf  (copy your file here for a stable path)
 *
 * Usage:
 *   TEST_BEARER_TOKEN="eyJ..." pnpm --filter api test:resume:local
 *   TEST_BEARER_TOKEN="eyJ..." pnpm --filter api test:resume:local /path/to/other.pdf
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const API_BASE_URL = (process.env.API_BASE_URL ?? 'http://localhost:3001').replace(/\/$/, '');
const token = process.env.TEST_BEARER_TOKEN?.trim();

function resolveResumePath() {
  const candidates = [
    process.env.RESUME_PDF_PATH?.trim(),
    process.argv[2]?.trim(),
    '/mnt/c/Users/hskan/Downloads/resume.pdf',
    'C:\\Users\\hskan\\Downloads\\resume.pdf',
    path.join(__dirname, '../test/fixtures/user-resume.pdf'),
  ].filter(Boolean);

  for (const p of candidates) {
    try {
      if (fs.existsSync(p) && fs.statSync(p).isFile()) return p;
    } catch {
      /* continue */
    }
  }

  console.error('No resume PDF found. Tried:\n  ' + candidates.join('\n  '));
  console.error('\nSet RESUME_PDF_PATH, pass a path as the first argument, or copy your file to:');
  console.error('  apps/api/test/fixtures/user-resume.pdf\n');
  process.exit(1);
}

async function main() {
  if (!token) {
    console.error('Missing TEST_BEARER_TOKEN (Supabase JWT from session.access_token).');
    process.exit(1);
  }

  const filePath = resolveResumePath();
  const buffer = fs.readFileSync(filePath);
  const fileBase64 = buffer.toString('base64');
  const fileName = path.basename(filePath) || 'resume.pdf';

  console.error(`Using resume: ${filePath} (${buffer.length} bytes)`);
  console.error(`POST ${API_BASE_URL}/v1/resume/parse\n`);

  const res = await fetch(`${API_BASE_URL}/v1/resume/parse`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ fileBase64, fileName }),
  });

  const text = await res.text();
  let body;
  try {
    body = JSON.parse(text);
  } catch {
    body = text;
  }

  if (!res.ok) {
    console.error(`HTTP ${res.status}`);
    console.error(typeof body === 'string' ? body : JSON.stringify(body, null, 2));
    process.exit(1);
  }

  console.log(JSON.stringify(body, null, 2));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
