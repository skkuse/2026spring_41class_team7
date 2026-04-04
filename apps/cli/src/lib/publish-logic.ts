import { readFile } from "node:fs/promises";
import {
  loadConfig,
  saveConfig,
  scanResultPath,
} from "./config.js";
import { gitOriginSlug } from "./git-info.js";
import type { ScanResultFile } from "./scan-types.js";

export const FREE_PUBLISH_LIMIT = 5;

export type PublishOutcome =
  | { kind: "blocked" }
  | { kind: "error"; message: string }
  | {
      kind: "ok";
      url: string;
      detail: string;
      publishCount: number;
    };

export async function attemptPublish(cwd: string): Promise<PublishOutcome> {
  let cfg = await loadConfig();
  if (!cfg) {
    return { kind: "error", message: "Run jobclaw init first." };
  }

  if (cfg.publishCount >= FREE_PUBLISH_LIMIT && !cfg.subscribedAt) {
    return { kind: "blocked" };
  }

  let scan: ScanResultFile;
  try {
    const raw = await readFile(scanResultPath(cwd), "utf8");
    scan = JSON.parse(raw) as ScanResultFile;
  } catch {
    return {
      kind: "error",
      message: "No scan result. Run jobclaw scan in this repo first.",
    };
  }

  const slug = await gitOriginSlug(cwd);
  const user = cfg.githubUsername ?? slug?.username ?? "your-github-username";
  const repo = slug?.repo ?? "your-repo";

  cfg = {
    ...cfg,
    publishCount: cfg.publishCount + 1,
  };
  await saveConfig(cfg);

  const publicUrl = `https://jobclaw.fyi/${user}/${repo}`;
  return {
    kind: "ok",
    url: publicUrl,
    publishCount: cfg.publishCount,
    detail: `Published (local record). Scan from ${scan.generatedAt} — ${cfg.publishCount} total publish(es).`,
  };
}

export async function recordSubscription(): Promise<void> {
  const cfg = await loadConfig();
  if (!cfg) return;
  await saveConfig({
    ...cfg,
    subscribedAt: new Date().toISOString(),
  });
}
