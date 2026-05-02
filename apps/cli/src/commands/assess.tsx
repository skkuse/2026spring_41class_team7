import React, { useEffect, useMemo, useState } from "react";
import { Box, Text } from "ink";
import path from "node:path";
import { mkdir, writeFile } from "node:fs/promises";
import {
  formatAssessmentMarkdown,
  runBackendAssessment,
} from "../lib/backend-assessment.js";
import { parseAssessCommandArgv } from "../lib/workspace-agent/index.js";

type Props = {
  cwd: string;
  /** Non-flag arguments after `assess` */
  args: string[];
  onDone: (code: number) => void;
};

const ASSESS_HELP = `jobclaw assess [path]
  path       Repository root to scan (default: current directory)
  --model    OpenAI model id (default: OPENAI_MODEL / JOBCLAW_OPENAI_MODEL / gpt-4o-mini)
  --json     Print raw JSON only (stdout)
  --out FILE Write report: .md = markdown report, other ext = raw JSON (e.g. report.json)
  OPENAI_API_KEY or ~/.jobclaw/secrets.json (via jobclaw init)

Default: prints to the terminal only (no file). Use --out or redirect stdout.`;

export default function AssessCommand({ cwd, args, onDone }: Props) {
  const parsed = useMemo(() => parseAssessCommandArgv(cwd, args), [cwd, args]);
  const [line, setLine] = useState("Starting backend assessment…");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (parsed.help) {
      onDone(0);
      return;
    }
    void (async () => {
      try {
        const { repoRoot, model, jsonOnly, outPath } = parsed;
        setLine(`Bundling source from ${repoRoot}…`);

        setLine("Calling OpenAI (this may take a minute)…");
        const { result, rawJson, contextChars } = await runBackendAssessment({
          repoRoot,
          model,
        });

        if (outPath) {
          const dir = path.dirname(outPath);
          await mkdir(dir, { recursive: true });
          const ext = path.extname(outPath).toLowerCase();
          if (ext === ".md") {
            const md = formatAssessmentMarkdown(result, {
              repoRoot,
              contextChars,
            });
            await writeFile(outPath, md, "utf8");
          } else {
            await writeFile(outPath, rawJson, "utf8");
          }
        }

        if (jsonOnly) {
          console.log(rawJson);
          setLine(
            `Done. Context: ${contextChars} characters.${outPath ? ` Wrote ${outPath}.` : ""}`,
          );
          onDone(0);
          return;
        }

        const s = result.scores;
        setLine(
          `Context: ${contextChars} chars · Overall ${result.overallScore}/100${outPath ? ` · Wrote ${outPath}` : ""}\n\n` +
            `Scores (0–10): OpenAPI ${s.openapi} · Zod ${s.zodValidation} · Rate limit ${s.rateLimiting} · Cache ${s.caching} · Prisma ${s.prismaModels}\n\n` +
            `${result.executiveSummary}\n\n` +
            `Findings:\n${result.findings.map((f) => `• ${f}`).join("\n")}\n\n` +
            `Gaps & risks:\n${result.gapsAndRisks.map((f) => `• ${f}`).join("\n")}\n\n` +
            `Next steps:\n${result.nextSteps.map((f, i) => `${i + 1}. ${f}`).join("\n")}`,
        );
        onDone(0);
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        setError(msg);
        onDone(1);
      }
    })();
  }, [
    cwd,
    args,
    onDone,
    parsed.help,
    parsed.repoRoot,
    parsed.model,
    parsed.jsonOnly,
    parsed.outPath,
  ]);

  if (parsed.help) {
    return (
      <Box flexDirection="column">
        <Text>{ASSESS_HELP}</Text>
      </Box>
    );
  }

  if (error) {
    return (
      <Box flexDirection="column">
        <Text color="red">{error}</Text>
      </Box>
    );
  }

  return (
    <Box flexDirection="column">
      <Text>{line}</Text>
    </Box>
  );
}
