import path from "node:path";
import { isGitRepo, gitTimeline } from "./git-info.js";
import { runAgent1ManifestScan } from "./scan-manifests.js";
import { bundleSourceContext } from "./source-snippet.js";
import {
  fetchEvaluationPrompt,
  runAgent2Evaluation,
} from "./evaluation.js";
import type { ScanResultFile } from "./scan-types.js";

/**
 * Full legacy “scan” pipeline: git timeline, manifest agent, server (or fallback)
 * evaluation prompt + OpenAI agent2 — **no file I/O**. Used by `jobclaw assess` before
 * the backend-specific assessment.
 */
export async function runRepositoryScan(
  repoRoot: string,
): Promise<ScanResultFile> {
  const root = path.resolve(repoRoot);
  if (!(await isGitRepo(root))) {
    throw new Error("Not a git repository (no .git).");
  }

  const timeline = await gitTimeline(root);
  const agent1 = await runAgent1ManifestScan(root);
  const apiBase =
    process.env.JOBCLAW_API_URL ?? "https://api.jobclaw.fyi";
  const { payload, source } = await fetchEvaluationPrompt(apiBase);
  const sourceContext = await bundleSourceContext(root);
  const agent2 = await runAgent2Evaluation(payload, source, sourceContext);

  return {
    generatedAt: new Date().toISOString(),
    repoRoot: root,
    timeline,
    agent1: {
      skills: agent1.skills,
      libraries: agent1.libraries,
      manifests: agent1.manifests,
    },
    agent2,
  };
}
