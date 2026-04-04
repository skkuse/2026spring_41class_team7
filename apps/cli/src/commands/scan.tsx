import React, { useEffect, useState } from "react";
import { Box, Text } from "ink";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { isGitRepo, gitTimeline } from "../lib/git-info.js";
import { runAgent1ManifestScan } from "../lib/scan-manifests.js";
import { bundleSourceContext } from "../lib/source-snippet.js";
import {
  fetchEvaluationPrompt,
  runAgent2Evaluation,
} from "../lib/evaluation.js";
import { jobclawProjectDir, scanResultPath } from "../lib/config.js";
import type { ScanResultFile } from "../lib/scan-types.js";

type Props = {
  cwd: string;
  onDone: (code: number) => void;
};

export default function ScanCommand({ cwd, onDone }: Props) {
  const [line, setLine] = useState("Scanning repository…");

  useEffect(() => {
    void (async () => {
      try {
        if (!(await isGitRepo(cwd))) {
          setLine("Error: not a git repository (no .git).");
          onDone(1);
          return;
        }

        setLine("Reading git history…");
        const timeline = await gitTimeline(cwd);

        setLine("Agent 1: scanning package manifests…");
        const agent1 = await runAgent1ManifestScan(cwd);

        setLine("Agent 2: loading evaluation prompt…");
        const apiBase =
          process.env.JOBCLAW_API_URL ?? "https://api.jobclaw.fyi";
        const { payload, source } = await fetchEvaluationPrompt(apiBase);

        setLine("Agent 2: bundling source context…");
        const sourceContext = await bundleSourceContext(cwd);

        setLine("Agent 2: running evaluation…");
        const agent2 = await runAgent2Evaluation(
          payload,
          source,
          sourceContext,
        );

        const out: ScanResultFile = {
          generatedAt: new Date().toISOString(),
          repoRoot: path.resolve(cwd),
          timeline,
          agent1: {
            skills: agent1.skills,
            libraries: agent1.libraries,
            manifests: agent1.manifests,
          },
          agent2,
        };

        const dir = jobclawProjectDir(cwd);
        await mkdir(dir, { recursive: true });
        const file = scanResultPath(cwd);
        await writeFile(file, JSON.stringify(out, null, 2), "utf8");

        setLine(`Wrote ${file} (agent1 + agent2 JSON inside).`);
        onDone(0);
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        setLine(`Error: ${msg}`);
        onDone(1);
      }
    })();
  }, [cwd, onDone]);

  return (
    <Box flexDirection="column">
      <Text bold color="cyan">
        jobclaw scan
      </Text>
      <Text>{line}</Text>
    </Box>
  );
}
