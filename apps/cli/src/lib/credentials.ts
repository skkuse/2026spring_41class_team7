import { readFileSync } from "node:fs";
import { secretsPath } from "./secrets.js";

function readOpenAiFromSecretsFile(): string | undefined {
  try {
    const raw = readFileSync(secretsPath(), "utf8");
    const parsed = JSON.parse(raw) as { openaiApiKey?: string };
    return parsed.openaiApiKey?.trim() || undefined;
  } catch {
    return undefined;
  }
}

/** Prefer `OPENAI_API_KEY` env, then ~/.jobclaw/secrets.json */
export function getOpenAiApiKey(): string | undefined {
  const fromEnv = process.env.OPENAI_API_KEY?.trim();
  if (fromEnv) return fromEnv;
  return readOpenAiFromSecretsFile();
}
