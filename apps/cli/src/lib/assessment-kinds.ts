/** Expand this union when new assessment prompts / runners are added. */
export type AssessmentKind = "node-backend";

export type AssessmentOption = {
  id: AssessmentKind;
  label: string;
  /** Short CLI token for `--type` */
  cliValue: string;
};

export const ASSESSMENT_OPTIONS: AssessmentOption[] = [
  {
    id: "node-backend",
    cliValue: "node-backend",
    label: "Node.js backend (OpenAPI, Zod, rate limit, cache, Prisma)",
  },
];

export function parseAssessmentKind(token: string): AssessmentKind | undefined {
  const t = token.trim().toLowerCase();
  for (const o of ASSESSMENT_OPTIONS) {
    if (o.cliValue === t || o.id === t) return o.id;
  }
  return undefined;
}

export function formatAssessmentTypeList(): string {
  return ASSESSMENT_OPTIONS.map((o) => `  ${o.cliValue}`).join("\n");
}
