import React, { useEffect, useMemo, useRef, useState } from "react";
import { Box, Text, useInput } from "ink";
import path from "node:path";
import { mkdir, writeFile } from "node:fs/promises";
import {
  formatEvaluationMarkdown,
  runBackendEvaluation,
  type BackendEvaluationResult,
} from "../lib/backend-evaluation.js";
import { jobclawProjectDir, scanResultPath } from "../lib/config.js";
import { runRepositoryScan } from "../lib/run-repository-scan.js";
import { saveEvaluationRecord } from "../lib/evaluation-record.js";
import {
  EVALUATION_OPTIONS,
  formatEvaluationTypeList,
  type EvaluationKind,
} from "../lib/evaluation-kinds.js";
import { parseEvaluateCommandArgv } from "../lib/workspace-agent/index.js";
import EvaluationResultView, { type EvaluationResultMeta } from "./evaluate-result.js";
import { CommandHeader, ErrorBox, StatusStep } from "../ui/index.js";

type Props = {
  cwd: string;
  args: string[];
  onDone: (code: number) => void;
};

const EVALUATE_HELP = `jobclaw evaluate [path]
  path       Repository root (default: current directory)
  Flow       (1) Repo scan — git timeline, manifests, general evaluation → .jobclaw/scan-result.json
             (2) Backend evaluation → .jobclaw/evaluations/*.json
  --type,-t  Evaluation profile (${EVALUATION_OPTIONS.map((o) => o.cliValue).join(" | ")})
             Required in CI / non-TTY (no interactive menu).
  --model    OpenAI model id (default: OPENAI_MODEL / JOBCLAW_OPENAI_MODEL / gpt-4o-mini)
  --json     Print raw JSON only (stdout)
  --out FILE Write report: .md = markdown report, other ext = raw JSON (e.g. report.json)
  OPENAI_API_KEY or ~/.jobclaw/secrets.json (via jobclaw init)`;

function EvaluationTypePicker({
  onChosen,
}: {
  onChosen: (k: EvaluationKind) => void;
}) {
  const [idx, setIdx] = useState(0);
  useInput((_, key) => {
    if (key.upArrow) setIdx((i) => Math.max(0, i - 1));
    if (key.downArrow)
      setIdx((i) => Math.min(EVALUATION_OPTIONS.length - 1, i + 1));
    if (key.return) {
      const opt = EVALUATION_OPTIONS[idx];
      if (opt) onChosen(opt.id);
    }
  });
  return (
    <Box flexDirection="column" marginBottom={1}>
      <Text bold>Select evaluation type</Text>
      {EVALUATION_OPTIONS.map((o, i) => (
        <Text key={o.id} color={i === idx ? "cyan" : undefined}>
          {i === idx ? "❯ " : "  "}
          {o.label}
        </Text>
      ))}
      <Text dimColor>↑↓ move · Enter confirm</Text>
    </Box>
  );
}

export default function EvaluateCommand({ cwd, args, onDone }: Props) {
  const parsed = useMemo(() => parseEvaluateCommandArgv(cwd, args), [cwd, args]);
  const [pickedType, setPickedType] = useState<EvaluationKind | null>(() =>
    parsed.evaluationType ?? null,
  );
  const [progressPhase, setProgressPhase] = useState<"scanning" | "evaluating" | "done" | null>(null);
  const [runError, setRunError] = useState<string | null>(null);
  const [doneResult, setDoneResult] = useState<{
    result: BackendEvaluationResult;
    meta: EvaluationResultMeta;
  } | null>(null);
  const ranRef = useRef(false);
  const finishedRef = useRef(false);

  const finish = (code: number) => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    onDone(code);
  };

  useEffect(() => {
    if (parsed.evaluationType) setPickedType(parsed.evaluationType);
  }, [parsed.evaluationType]);

  useEffect(() => {
    if (!parsed.help) return;
    finish(0);
  }, [parsed.help]);

  useEffect(() => {
    if (!parsed.invalidEvaluationType) return;
    setRunError(
      `Unknown evaluation type "${parsed.invalidEvaluationType}".\nValid:\n${formatEvaluationTypeList()}`,
    );
    finish(1);
  }, [parsed.invalidEvaluationType]);

  useEffect(() => {
    if (parsed.help || parsed.invalidEvaluationType) return;
    if (pickedType !== null) return;
    if (process.stdin.isTTY) return;
    setRunError(
      "Specify an evaluation type, e.g. --type node-backend\n(Non-interactive sessions cannot open the selection menu.)",
    );
    finish(1);
  }, [parsed.help, parsed.invalidEvaluationType, pickedType]);

  useEffect(() => {
    if (parsed.help || parsed.invalidEvaluationType) return;
    if (!pickedType) return;
    if (ranRef.current) return;
    if (pickedType !== "node-backend") {
      setRunError(`Evaluation "${pickedType}" is not implemented yet.`);
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

        setProgressPhase("evaluating");
        const { result, rawJson, contextChars, model: modelUsed } =
          await runBackendEvaluation({ repoRoot, model });

        const saved = await saveEvaluationRecord({
          repoRoot,
          evaluationType: pickedType,
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
            const md = formatEvaluationMarkdown(result, {
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
            evaluationType: pickedType,
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
    parsed.invalidEvaluationType,
    pickedType,
    parsed.repoRoot,
    parsed.model,
    parsed.jsonOnly,
    parsed.outPath,
  ]);

  if (parsed.help) {
    return (
      <Box flexDirection="column">
        <Text>{EVALUATE_HELP}</Text>
      </Box>
    );
  }

  if (parsed.invalidEvaluationType) {
    return (
      <Box flexDirection="column">
        <Text color="red">
          Unknown evaluation type &quot;{parsed.invalidEvaluationType}&quot;.
        </Text>
        <Text>Valid:{`\n${formatEvaluationTypeList()}`}</Text>
      </Box>
    );
  }

  if (runError) {
    return <ErrorBox message={runError} />;
  }

  if (pickedType === null && process.stdin.isTTY) {
    return (
      <EvaluationTypePicker
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
      <EvaluationResultView result={doneResult.result} meta={doneResult.meta} />
    );
  }

  return (
    <Box flexDirection="column">
      <CommandHeader title="JOBCLAW  ·  Node.js Backend Evaluation" />
      <Box flexDirection="column" paddingLeft={1}>
        <StatusStep
          label="Repository scan"
          status={
            progressPhase === "scanning"
              ? "active"
              : progressPhase === "evaluating" || progressPhase === "done"
                ? "done"
                : "pending"
          }
        />
        <StatusStep
          label="Backend evaluation"
          status={
            progressPhase === "evaluating"
              ? "active"
              : progressPhase === "done"
                ? "done"
                : "pending"
          }
          detail={progressPhase === "evaluating" ? "Bundling context & calling OpenAI…" : undefined}
        />
      </Box>
    </Box>
  );
}
