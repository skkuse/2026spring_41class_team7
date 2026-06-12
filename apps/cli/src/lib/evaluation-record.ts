import { mkdir, readdir, writeFile } from "node:fs/promises";
import path from "node:path";
import {
  evaluationsDir,
  newEvaluationJsonFileName,
} from "./config.js";
import type { EvaluationKind } from "./evaluation-kinds.js";
import type { BackendEvaluationResult } from "./backend-evaluation.js";

export const EVALUATION_RECORD_VERSION = 1 as const;

export type EvaluationRecordFile = {
  kind: "backend-evaluation";
  version: typeof EVALUATION_RECORD_VERSION;
  /** Which evaluation profile was run (e.g. node-backend). Omitted in legacy files. */
  evaluationType?: EvaluationKind;
  generatedAt: string;
  repoRoot: string;
  contextChars: number;
  model: string;
  result: BackendEvaluationResult;
  rawModelJson: string;
  savedAs: string;
};

export async function saveEvaluationRecord(input: {
  repoRoot: string;
  evaluationType: EvaluationKind;
  contextChars: number;
  model: string;
  result: BackendEvaluationResult;
  rawJson: string;
}): Promise<{ absolutePath: string; fileName: string }> {
  const root = path.resolve(input.repoRoot);
  const dir = evaluationsDir(root);
  await mkdir(dir, { recursive: true });
  const fileName = newEvaluationJsonFileName();
  const absolutePath = path.join(dir, fileName);
  const generatedAt = new Date().toISOString();
  const payload: EvaluationRecordFile = {
    kind: "backend-evaluation",
    version: EVALUATION_RECORD_VERSION,
    evaluationType: input.evaluationType,
    generatedAt,
    repoRoot: root,
    contextChars: input.contextChars,
    model: input.model,
    result: input.result,
    rawModelJson: input.rawJson,
    savedAs: fileName,
  };
  await writeFile(absolutePath, JSON.stringify(payload, null, 2), "utf8");
  return { absolutePath, fileName };
}

/** Newest JSON in `projectRoot/.jobclaw/evaluations` by filename (ISO-like names sort lexically). */
export async function latestEvaluationFile(
  projectRoot: string,
): Promise<string | undefined> {
  const dir = evaluationsDir(path.resolve(projectRoot));
  let names: string[];
  try {
    names = await readdir(dir);
  } catch {
    return undefined;
  }
  const jsons = names.filter((n) => n.endsWith(".json")).sort().reverse();
  const first = jsons[0];
  return first ? path.join(dir, first) : undefined;
}
