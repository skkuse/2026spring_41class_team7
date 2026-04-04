import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import os from "node:os";

export const CONFIG_VERSION = 1 as const;

export type JobclawConfig = {
  version: typeof CONFIG_VERSION;
  termsAccepted: boolean;
  privacyAccepted: boolean;
  openaiReady: boolean;
  /** Optional override for publish URL when git remote is missing. */
  githubUsername?: string;
  publishCount: number;
  /** Set after user confirms subscription (billing integration TBD). */
  subscribedAt?: string;
};

const defaultConfig = (): JobclawConfig => ({
  version: CONFIG_VERSION,
  termsAccepted: false,
  privacyAccepted: false,
  openaiReady: false,
  publishCount: 0,
});

export function configDir(): string {
  return path.join(os.homedir(), ".jobclaw");
}

export function configPath(): string {
  return path.join(configDir(), "config.json");
}

export function jobclawProjectDir(cwd: string): string {
  return path.join(cwd, ".jobclaw");
}

export function scanResultPath(cwd: string): string {
  return path.join(jobclawProjectDir(cwd), "scan-result.json");
}

function normalizeConfig(raw: Record<string, unknown>): JobclawConfig | null {
  if (raw.version !== CONFIG_VERSION) return null;
  return {
    version: CONFIG_VERSION,
    termsAccepted: Boolean(raw.termsAccepted),
    privacyAccepted: Boolean(raw.privacyAccepted),
    openaiReady: Boolean(raw.openaiReady),
    githubUsername:
      typeof raw.githubUsername === "string" ? raw.githubUsername : undefined,
    publishCount:
      typeof raw.publishCount === "number" && Number.isFinite(raw.publishCount)
        ? raw.publishCount
        : 0,
    subscribedAt:
      typeof raw.subscribedAt === "string" ? raw.subscribedAt : undefined,
  };
}

export async function loadConfig(): Promise<JobclawConfig | null> {
  try {
    const raw = await readFile(configPath(), "utf8");
    return normalizeConfig(JSON.parse(raw) as Record<string, unknown>);
  } catch {
    return null;
  }
}

export async function saveConfig(cfg: JobclawConfig): Promise<void> {
  await mkdir(configDir(), { recursive: true });
  await writeFile(configPath(), JSON.stringify(cfg, null, 2), "utf8");
}

export async function ensureDefaultConfig(): Promise<JobclawConfig> {
  const existing = await loadConfig();
  if (existing) return existing;
  const fresh = defaultConfig();
  await saveConfig(fresh);
  return fresh;
}
