/** Expand this union when new evaluation prompts / runners are added. */
export type EvaluationKind = "node-backend";

export type EvaluationOption = {
  id: EvaluationKind;
  label: string;
  /** Short CLI token for `--type` */
  cliValue: string;
};

export const EVALUATION_OPTIONS: EvaluationOption[] = [
  {
    id: "node-backend",
    cliValue: "node-backend",
    label: "Node.js backend (OpenAPI, Zod, rate limit, cache, Prisma)",
  },
];

export function parseEvaluationKind(token: string): EvaluationKind | undefined {
  const t = token.trim().toLowerCase();
  for (const o of EVALUATION_OPTIONS) {
    if (o.cliValue === t || o.id === t) return o.id;
  }
  return undefined;
}

export function formatEvaluationTypeList(): string {
  return EVALUATION_OPTIONS.map((o) => `  ${o.cliValue}`).join("\n");
}
