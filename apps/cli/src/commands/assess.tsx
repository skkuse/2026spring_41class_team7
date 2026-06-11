import React, { useEffect, useMemo, useRef, useState } from "react";
import { Box, Text, useInput } from "ink";
import path from "node:path";
import { mkdir, writeFile } from "node:fs/promises";
import {
  formatAssessmentMarkdown,
  runBackendAssessment,
  type BackendAssessmentResult,
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
import AssessmentResultView, { type AssessmentResultMeta } from "./assess-result.js";
import { CommandHeader, ErrorBox, StatusStep } from "../ui/index.js";

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
  const [progressPhase, setProgressPhase] = useState<"scanning" | "assessing" | "done" | null>(null);
  const [runError, setRunError] = useState<string | null>(null);
  const [doneResult, setDoneResult] = useState<{
    result: BackendAssessmentResult;
    meta: AssessmentResultMeta;
  } | null>(null);
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

        setProgressPhase("scanning");
        const scanOut = await runRepositoryScan(repoRoot);
        await mkdir(jobclawProjectDir(repoRoot), { recursive: true });
        await writeFile(
          scanResultPath(repoRoot),
          JSON.stringify(scanOut, null, 2),
          "utf8",
        );

        setProgressPhase("assessing");
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
          setProgressPhase("done");
          finish(0);
          return;
        }

        setDoneResult({
          result,
          meta: {
            assessmentType: pickedType,
            scanPath: scanResultPath(repoRoot),
            savedPath: saved.absolutePath,
            contextChars,
            outPath: outPath ?? undefined,
          },
        });
        setProgressPhase("done");
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
    return <ErrorBox message={runError} />;
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

  if (doneResult) {
    return (
      <AssessmentResultView result={doneResult.result} meta={doneResult.meta} />
    );
  }

  return (
    <Box flexDirection="column">
      <CommandHeader title="JOBCLAW  ·  Node.js Backend Assessment" />
      <Box flexDirection="column" paddingLeft={1}>
        <StatusStep
          label="Repository scan"
          status={
            progressPhase === "scanning"
              ? "active"
              : progressPhase === "assessing" || progressPhase === "done"
                ? "done"
                : "pending"
          }
        />
        <StatusStep
          label="Backend assessment"
          status={
            progressPhase === "assessing"
              ? "active"
              : progressPhase === "done"
                ? "done"
                : "pending"
          }
          detail={progressPhase === "assessing" ? "Bundling context & calling OpenAI…" : undefined}
        />
      </Box>
    </Box>
  );
}
