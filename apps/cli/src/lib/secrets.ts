import { chmod, mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { configDir } from "./config.js";

export type JobclawSecrets = {
  openaiApiKey?: string;
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
    return { openaiApiKey: openai };
  } catch {
    return {};
  }
}

export async function saveSecrets(partial: {
  openaiApiKey?: string;
}): Promise<void> {
  const dir = configDir();
  await mkdir(dir, { recursive: true });
  const prev = await loadSecrets();
  const openai =
    partial.openaiApiKey !== undefined
      ? partial.openaiApiKey.trim() || undefined
      : prev.openaiApiKey;
  const next: JobclawSecrets = { openaiApiKey: openai };
  await writeFile(secretsPath(), JSON.stringify(next, null, 2), "utf8");
  await chmod(secretsPath(), 0o600);
}
