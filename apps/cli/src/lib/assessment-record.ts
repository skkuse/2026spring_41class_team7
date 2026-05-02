import { mkdir, readdir, writeFile } from "node:fs/promises";
import path from "node:path";
import {
  assessmentsDir,
  newAssessmentJsonFileName,
} from "./config.js";
import type { AssessmentKind } from "./assessment-kinds.js";
import type { BackendAssessmentResult } from "./backend-assessment.js";

export const ASSESSMENT_RECORD_VERSION = 1 as const;

export type AssessmentRecordFile = {
  kind: "backend-assessment";
  version: typeof ASSESSMENT_RECORD_VERSION;
  /** Which assessment profile was run (e.g. node-backend). Omitted in legacy files. */
  assessmentType?: AssessmentKind;
  generatedAt: string;
  repoRoot: string;
  contextChars: number;
  model: string;
  result: BackendAssessmentResult;
  rawModelJson: string;
  savedAs: string;
};

export async function saveAssessmentRecord(input: {
  repoRoot: string;
  assessmentType: AssessmentKind;
  contextChars: number;
  model: string;
  result: BackendAssessmentResult;
  rawJson: string;
}): Promise<{ absolutePath: string; fileName: string }> {
  const root = path.resolve(input.repoRoot);
  const dir = assessmentsDir(root);
  await mkdir(dir, { recursive: true });
  const fileName = newAssessmentJsonFileName();
  const absolutePath = path.join(dir, fileName);
  const generatedAt = new Date().toISOString();
  const payload: AssessmentRecordFile = {
    kind: "backend-assessment",
    version: ASSESSMENT_RECORD_VERSION,
    assessmentType: input.assessmentType,
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

/** Newest JSON in `projectRoot/.jobclaw/assessments` by filename (ISO-like names sort lexically). */
export async function latestAssessmentFile(
  projectRoot: string,
): Promise<string | undefined> {
  const dir = assessmentsDir(path.resolve(projectRoot));
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
