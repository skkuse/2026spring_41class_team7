import React, { useEffect, useMemo, useRef, useState } from "react";
import { Box, Text, useInput } from "ink";
import path from "node:path";
import { mkdir, writeFile } from "node:fs/promises";
import {
  formatAssessmentMarkdown,
  runBackendAssessment,
} from "../lib/backend-assessment.js";
import { jobclawProjectDir, scanResultPath } from "../lib/config.js";
import { runRepositoryScan } from "../lib/run-repository-scan.js";
import { saveAssessmentRecord } from "../lib/assessment-record.js";
import {
  ASSESSMENT_OPTIONS,
  formatAssessmentTypeList,
  type AssessmentKind,
} from "../lib/assessment-kinds.js";
import { parseAssessCommandArgv } from "../lib/workspace-agent/index.js";

type Props = {
  cwd: string;
  args: string[];
  onDone: (code: number) => void;
};

const ASSESS_HELP = `jobclaw assess [path]
  path       Repository root (default: current directory)
  Flow       (1) Repo scan — git timeline, manifests, general evaluation → .jobclaw/scan-result.json
             (2) Backend assessment → .jobclaw/assessments/*.json
  --type,-t  Assessment profile (${ASSESSMENT_OPTIONS.map((o) => o.cliValue).join(" | ")})
             Required in CI / non-TTY (no interactive menu).
  --model    OpenAI model id (default: OPENAI_MODEL / JOBCLAW_OPENAI_MODEL / gpt-4o-mini)
  --json     Print raw JSON only (stdout)
  --out FILE Write report: .md = markdown report, other ext = raw JSON (e.g. report.json)
  OPENAI_API_KEY or ~/.jobclaw/secrets.json (via jobclaw init)`;

function AssessmentTypePicker({
  onChosen,
}: {
  onChosen: (k: AssessmentKind) => void;
}) {
  const [idx, setIdx] = useState(0);
  useInput((_, key) => {
    if (key.upArrow) setIdx((i) => Math.max(0, i - 1));
    if (key.downArrow)
      setIdx((i) => Math.min(ASSESSMENT_OPTIONS.length - 1, i + 1));
    if (key.return) {
      const opt = ASSESSMENT_OPTIONS[idx];
      if (opt) onChosen(opt.id);
    }
  });
  return (
    <Box flexDirection="column" marginBottom={1}>
      <Text bold>Select assessment type</Text>
      {ASSESSMENT_OPTIONS.map((o, i) => (
        <Text key={o.id} color={i === idx ? "cyan" : undefined}>
          {i === idx ? "❯ " : "  "}
          {o.label}
        </Text>
      ))}
      <Text dimColor>↑↓ move · Enter confirm</Text>
    </Box>
  );
}

export default function AssessCommand({ cwd, args, onDone }: Props) {
  const parsed = useMemo(() => parseAssessCommandArgv(cwd, args), [cwd, args]);
  const [pickedType, setPickedType] = useState<AssessmentKind | null>(() =>
    parsed.assessmentType ?? null,
  );
  const [line, setLine] = useState("");
  const [runError, setRunError] = useState<string | null>(null);
  const ranRef = useRef(false);
  const finishedRef = useRef(false);

  const finish = (code: number) => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    onDone(code);
  };

  useEffect(() => {
    if (parsed.assessmentType) setPickedType(parsed.assessmentType);
  }, [parsed.assessmentType]);

  useEffect(() => {
    if (!parsed.help) return;
    finish(0);
  }, [parsed.help]);

  useEffect(() => {
    if (!parsed.invalidAssessmentType) return;
    setRunError(
      `Unknown assessment type "${parsed.invalidAssessmentType}".\nValid:\n${formatAssessmentTypeList()}`,
    );
    finish(1);
  }, [parsed.invalidAssessmentType]);

  useEffect(() => {
    if (parsed.help || parsed.invalidAssessmentType) return;
    if (pickedType !== null) return;
    if (process.stdin.isTTY) return;
    setRunError(
      "Specify an assessment type, e.g. --type node-backend\n(Non-interactive sessions cannot open the selection menu.)",
    );
    finish(1);
  }, [parsed.help, parsed.invalidAssessmentType, pickedType]);

  useEffect(() => {
    if (parsed.help || parsed.invalidAssessmentType) return;
    if (!pickedType) return;
    if (ranRef.current) return;
    if (pickedType !== "node-backend") {
      setRunError(`Assessment "${pickedType}" is not implemented yet.`);
      finish(1);
      return;
    }
    ranRef.current = true;

    void (async () => {
      try {
        const { repoRoot, model, jsonOnly, outPath } = parsed;

        setLine("Repository scan: git timeline & manifests…");
        const scanOut = await runRepositoryScan(repoRoot);
        setLine("Repository scan: writing scan-result.json…");
        await mkdir(jobclawProjectDir(repoRoot), { recursive: true });
        await writeFile(
          scanResultPath(repoRoot),
          JSON.stringify(scanOut, null, 2),
          "utf8",
        );

        setLine("Backend assessment: bundling & calling OpenAI…");
        const { result, rawJson, contextChars, model: modelUsed } =
          await runBackendAssessment({ repoRoot, model });

        const saved = await saveAssessmentRecord({
          repoRoot,
          assessmentType: pickedType,
          contextChars,
          model: modelUsed,
          result,
          rawJson,
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
            `Done. Wrote ${scanResultPath(repoRoot)}; assessment ${saved.fileName} → ${saved.absolutePath}. Context: ${contextChars} characters.${outPath ? ` · Wrote ${outPath}` : ""}`,
          );
          finish(0);
          return;
        }

        const s = result.scores;
        setLine(
          `Assessment: ${pickedType}\n\n` +
            `Scan: ${scanResultPath(repoRoot)}\n` +
            `Saved ${saved.fileName} → ${saved.absolutePath}\n\n` +
            `Context: ${contextChars} chars · Overall ${result.overallScore}/100${outPath ? ` · Wrote ${outPath}` : ""}\n\n` +
            `Scores (0–10): OpenAPI ${s.openapi} · Zod ${s.zodValidation} · Rate limit ${s.rateLimiting} · Cache ${s.caching} · Prisma ${s.prismaModels}\n\n` +
            `${result.executiveSummary}\n\n` +
            `Findings:\n${result.findings.map((f) => `• ${f}`).join("\n")}\n\n` +
            `Gaps & risks:\n${result.gapsAndRisks.map((f) => `• ${f}`).join("\n")}\n\n` +
            `Next steps:\n${result.nextSteps.map((f, i) => `${i + 1}. ${f}`).join("\n")}`,
        );
        finish(0);
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        setRunError(msg);
        finish(1);
      }
    })();
  }, [
    parsed.help,
    parsed.invalidAssessmentType,
    pickedType,
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

  if (parsed.invalidAssessmentType) {
    return (
      <Box flexDirection="column">
        <Text color="red">
          Unknown assessment type &quot;{parsed.invalidAssessmentType}&quot;.
        </Text>
        <Text>Valid:{`\n${formatAssessmentTypeList()}`}</Text>
      </Box>
    );
  }

  if (runError) {
    return (
      <Box flexDirection="column">
        <Text color="red">{runError}</Text>
      </Box>
    );
  }

  if (pickedType === null && process.stdin.isTTY) {
    return (
      <AssessmentTypePicker
        onChosen={(k) => {
          setPickedType(k);
        }}
      />
    );
  }

  if (pickedType === null) {
    return (
      <Box flexDirection="column">
        <Text dimColor>…</Text>
      </Box>
    );
  }

  return (
    <Box flexDirection="column">
      <Text>{line || "Starting assessment…"}</Text>
    </Box>
  );
}
