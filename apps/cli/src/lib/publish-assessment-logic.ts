import { readFile } from "node:fs/promises";
import path from "node:path";
import { loadConfig, saveConfig, scanResultPath } from "./config.js";
import { gitOriginSlug } from "./git-info.js";
import { latestAssessmentFile } from "./assessment-record.js";
import type { AssessmentRecordFile } from "./assessment-record.js";
import { FREE_PUBLISH_LIMIT } from "./publish-logic.js";
import type { ScanResultFile } from "./scan-types.js";
import { getSession } from "./auth-store.js";

const JOBCLAW_API_URL =
  process.env.JOBCLAW_API_URL?.replace(/\/$/, "") ??
  "https://jobclaw-api-production.up.railway.app";

export type PublishAssessmentOutcome =
  | { kind: "blocked" }
  | { kind: "error"; message: string }
  | {
      kind: "ok";
      url: string;
      detail: string;
      publishCount: number;
      recordPath: string;
    };

/**
 * `jobclaw publish`: requires **both** `scan-result.json` and the latest assessment under
 * `<projectRoot>/.jobclaw/`. Nothing is uploaded to a remote API in this package—the Jobclaw
 * API server (`apps/api`) does not define a publish endpoint yet; this only updates local
 * publish count and prints the public URL pattern.
 *
 * `cwd` is used for `git remote`; `projectRoot` is where `.jobclaw` lives (defaults to cwd).
 */
export async function attemptPublishAssessment(input: {
  cwd: string;
  projectRoot?: string;
  recordPath?: string;
}): Promise<PublishAssessmentOutcome> {
  let cfg = await loadConfig();
  if (!cfg) {
    return { kind: "error", message: "Run jobclaw init first." };
  }

  if (cfg.publishCount >= FREE_PUBLISH_LIMIT && !cfg.subscribedAt) {
    return { kind: "blocked" };
  }

  const projectRoot = path.resolve(input.projectRoot ?? input.cwd);

  let scan: ScanResultFile;
  try {
    const raw = await readFile(scanResultPath(projectRoot), "utf8");
    scan = JSON.parse(raw) as ScanResultFile;
  } catch {
    return {
      kind: "error",
      message: `No scan result under ${scanResultPath(projectRoot)}. Run jobclaw assess first (it writes scan-result.json).`,
    };
  }

  let recordPath = input.recordPath;
  if (!recordPath) {
    recordPath = await latestAssessmentFile(projectRoot);
  }
  if (!recordPath) {
    return {
      kind: "error",
      message: `No assessment JSON in ${path.join(projectRoot, ".jobclaw", "assessments")}. Run jobclaw assess first.`,
    };
  }

  let record: AssessmentRecordFile;
  try {
    const raw = await readFile(recordPath, "utf8");
    record = JSON.parse(raw) as AssessmentRecordFile;
    if (record.kind !== "backend-assessment" || record.version !== 1) {
      throw new Error("bad shape");
    }
  } catch {
    return {
      kind: "error",
      message: `Could not read assessment record: ${recordPath}`,
    };
  }

  const session = await getSession();
  if (!session) {
    return { kind: "error", message: "Run jobclaw login first to publish assessments." };
  }

  const slug = await gitOriginSlug(input.cwd);
  const repoUrl =
    slug
      ? `https://github.com/${slug.username}/${slug.repo}`
      : `https://github.com/unknown/unknown`;

  const payload = {
    repoUrl,
    assessmentType: record.assessmentType ?? "node-backend",
    overallScore: record.result.overallScore,
    scores: record.result.scores,
    scorecard: record.result.scorecard,
    findings: record.result.findings,
    gapsAndRisks: record.result.gapsAndRisks,
    nextSteps: record.result.nextSteps,
    executiveSummary: record.result.executiveSummary,
    model: record.model,
    contextChars: record.contextChars,
    generatedAt: record.generatedAt,
  };

  let apiUrl: string;
  let apiId: string;
  try {
    const res = await fetch(`${JOBCLAW_API_URL}/v1/assessments`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.accessToken}`,
      },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const text = await res.text().catch(() => res.statusText);
      return { kind: "error", message: `API error ${res.status}: ${text}` };
    }
    const data = (await res.json()) as { id: string; url: string };
    apiUrl = data.url;
    apiId = data.id;
  } catch (err) {
    return { kind: "error", message: `Could not reach Jobclaw API: ${String(err)}` };
  }

  cfg = { ...cfg, publishCount: cfg.publishCount + 1 };
  await saveConfig(cfg);

  return {
    kind: "ok",
    url: apiUrl,
    publishCount: cfg.publishCount,
    recordPath,
    detail: `Published (id: ${apiId}). Scan ${scan.generatedAt}; assessment ${record.savedAs}${record.assessmentType ? ` (${record.assessmentType})` : ""} @ ${record.generatedAt} — ${cfg.publishCount} total publish(es).`,
  };
}
