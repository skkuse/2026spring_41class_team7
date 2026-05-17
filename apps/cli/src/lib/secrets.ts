import { chmod, mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { configDir } from "./config.js";

export type StoredUser = {
  id: string;
  email: string;
  githubUsername: string;
};

export type SupabaseSession = {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
  user: StoredUser;
};

export type JobclawSecrets = {
  openaiApiKey?: string;
  supabaseSession?: SupabaseSession;
};

export function secretsPath(): string {
  return path.join(configDir(), "secrets.json");
}

export async function loadSecrets(): Promise<JobclawSecrets> {
  try {
    const raw = await readFile(secretsPath(), "utf8");
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    const openai =
      typeof parsed.openaiApiKey === "string" ? parsed.openaiApiKey : undefined;
    const session = parseSupabaseSession(parsed.supabaseSession);
    return { openaiApiKey: openai, supabaseSession: session ?? undefined };
  } catch {
    return {};
  }
}

export async function saveSecrets(secrets: Partial<JobclawSecrets>): Promise<void> {
  const dir = configDir();
  await mkdir(dir, { recursive: true });
  const prev = await loadSecrets();
  const next: JobclawSecrets = {
    openaiApiKey:
      secrets.openaiApiKey !== undefined
        ? secrets.openaiApiKey.trim() || undefined
        : prev.openaiApiKey,
    supabaseSession:
      secrets.supabaseSession !== undefined
        ? secrets.supabaseSession
        : prev.supabaseSession,
  };
  await writeFile(secretsPath(), JSON.stringify(next, null, 2), "utf8");
  await chmod(secretsPath(), 0o600);
}

function parseSupabaseSession(raw: unknown): SupabaseSession | null {
  if (!raw || typeof raw !== 'object') return null;
  const r = raw as Record<string, unknown>;
  if (
    typeof r.accessToken !== 'string' ||
    typeof r.refreshToken !== 'string' ||
    typeof r.expiresAt !== 'number' ||
    !r.user || typeof r.user !== 'object'
  ) return null;
  const u = r.user as Record<string, unknown>;
  if (
    typeof u.id !== 'string' ||
    typeof u.email !== 'string' ||
    typeof u.githubUsername !== 'string'
  ) return null;
  return {
    accessToken: r.accessToken,
    refreshToken: r.refreshToken,
    expiresAt: r.expiresAt,
    user: { id: u.id, email: u.email, githubUsername: u.githubUsername },
  };
}
