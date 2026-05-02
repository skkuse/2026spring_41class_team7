import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { bundleBackendAssessmentContext } from "./bundle-backend-context.js";
import { getOpenAiApiKey } from "./credentials.js";

const PROMPT_REL = "../../prompts/assessments/node-backend-assessment.prompt.md";

export type BackendAssessmentCriterion =
  | "openapi"
  | "zodValidation"
  | "rateLimiting"
  | "caching"
  | "prismaModels";

export type BackendAssessmentScores = Record<BackendAssessmentCriterion, number>;

export type ScorecardRow = {
  criterion: string;
  score: number;
  status: "Strong" | "Partial" | "Missing";
  confidence: "High" | "Medium" | "Low";
  rationale: string;
};

export type BackendAssessmentResult = {
  executiveSummary: string;
  scores: BackendAssessmentScores;
  /** Average of five criterion scores × 10 → 0–100 */
  overallScore: number;
  scorecard: ScorecardRow[];
  findings: string[];
  gapsAndRisks: string[];
  nextSteps: string[];
};

function resolvePromptPath(): string {
  const here = path.dirname(fileURLToPath(import.meta.url));
  return path.resolve(here, PROMPT_REL);
}

export async function loadAssessmentPromptTemplate(): Promise<string> {
  return readFile(resolvePromptPath(), "utf8");
}

const JSON_SHAPE = `Respond with ONLY valid JSON (no markdown fences) matching exactly:
{
  "executiveSummary": string,
  "scores": {
    "openapi": number,
    "zodValidation": number,
    "rateLimiting": number,
    "caching": number,
    "prismaModels": number
  },
  "overallScore": number,
  "scorecard": [
    {
      "criterion": string,
      "score": number,
      "status": "Strong" | "Partial" | "Missing",
      "confidence": "High" | "Medium" | "Low",
      "rationale": string
    }
  ],
  "findings": string[],
  "gapsAndRisks": string[],
  "nextSteps": string[]
}

Rules:
- Each value in "scores" must be an integer from 0 through 10 (10 = excellent).
- "overallScore" must be an integer 0–100: round the average of the five scores × 10 (same weight per criterion).
- "scorecard" must have exactly 5 entries, one per criterion name: OpenAPI documentation, Zod validation, Rate limiting, Caching, Prisma models. Each "score" matches the same 0–10 scale.
- Base everything only on the provided repository excerpts; if something cannot be verified from excerpts, lower confidence and say so in rationale.`;

function clampScore(n: unknown): number {
  const x = typeof n === "number" ? n : Number(n);
  if (!Number.isFinite(x)) return 0;
  return Math.max(0, Math.min(10, Math.round(x)));
}

function normalizeResult(raw: unknown): BackendAssessmentResult {
  const o = raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {};
  const sc = o.scores && typeof o.scores === "object" ? (o.scores as Record<string, unknown>) : {};
  const scores: BackendAssessmentScores = {
    openapi: clampScore(sc.openapi),
    zodValidation: clampScore(sc.zodValidation),
    rateLimiting: clampScore(sc.rateLimiting),
    caching: clampScore(sc.caching),
    prismaModels: clampScore(sc.prismaModels),
  };
  const avg =
    (scores.openapi +
      scores.zodValidation +
      scores.rateLimiting +
      scores.caching +
      scores.prismaModels) /
    5;
  const overall =
    typeof o.overallScore === "number" && Number.isFinite(o.overallScore)
      ? Math.max(0, Math.min(100, Math.round(o.overallScore)))
      : Math.round(avg * 10);

  const scorecard: ScorecardRow[] = Array.isArray(o.scorecard)
    ? (o.scorecard as unknown[])
        .map((row): ScorecardRow | null => {
          const r = row && typeof row === "object" ? (row as Record<string, unknown>) : {};
          const status: ScorecardRow["status"] =
            r.status === "Strong" || r.status === "Partial" || r.status === "Missing"
              ? r.status
              : "Partial";
          const confidence: ScorecardRow["confidence"] =
            r.confidence === "High" || r.confidence === "Medium" || r.confidence === "Low"
              ? r.confidence
              : "Medium";
          const criterion = String(r.criterion ?? "");
          if (!criterion) return null;
          return {
            criterion,
            score: clampScore(r.score),
            status,
            confidence,
            rationale: String(r.rationale ?? ""),
          };
        })
        .filter((x): x is ScorecardRow => x !== null)
    : [];

  return {
    executiveSummary: String(o.executiveSummary ?? ""),
    scores,
    overallScore: overall,
    scorecard,
    findings: Array.isArray(o.findings) ? o.findings.map((x) => String(x)) : [],
    gapsAndRisks: Array.isArray(o.gapsAndRisks) ? o.gapsAndRisks.map((x) => String(x)) : [],
    nextSteps: Array.isArray(o.nextSteps) ? o.nextSteps.map((x) => String(x)) : [],
  };
}

export type RunBackendAssessmentOptions = {
  repoRoot: string;
  model?: string;
};

export async function runBackendAssessment(
  options: RunBackendAssessmentOptions,
): Promise<{ result: BackendAssessmentResult; rawJson: string; contextChars: number }> {
  const apiKey = getOpenAiApiKey();
  if (!apiKey) {
    throw new Error(
      "Missing OpenAI API key. Set OPENAI_API_KEY or run `jobclaw init` to store a key in ~/.jobclaw/secrets.json",
    );
  }

  const template = await loadAssessmentPromptTemplate();
  const root = path.resolve(options.repoRoot);
  const rubric = template.replace(/\{\{ROOT\}\}/g, root);

  const context = await bundleBackendAssessmentContext(root);
  const model =
    options.model ??
    process.env.JOBCLAW_OPENAI_MODEL ??
    process.env.OPENAI_MODEL ??
    "gpt-4o-mini";

  const system = `You are a senior backend engineer. ${JSON_SHAPE}`;

  const user = `${rubric}

---

The repository files below are truncated excerpts from disk at ${root}. Assess based only on this evidence.

--- Repository excerpts ---

${context}`;

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      temperature: 0.2,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: system },
        { role: "user", content: user.slice(0, 180_000) },
      ],
    }),
    signal: AbortSignal.timeout(180_000),
  });

  if (!res.ok) {
    const t = await res.text();
    throw new Error(t || `${res.status} ${res.statusText}`);
  }

  const data = (await res.json()) as {
    choices?: { message?: { content?: string } }[];
  };
  const content = data.choices?.[0]?.message?.content;
  if (!content) throw new Error("Empty completion from OpenAI");

  const parsed = JSON.parse(content) as unknown;
  const result = normalizeResult(parsed);

  return {
    result,
    rawJson: content,
    contextChars: context.length,
  };
}

/** Renders a structured report for `--out report.md`. */
export function formatAssessmentMarkdown(
  result: BackendAssessmentResult,
  meta: { repoRoot: string; contextChars: number; generatedAt?: string },
): string {
  const when = meta.generatedAt ?? new Date().toISOString();
  const s = result.scores;
  const rows =
    result.scorecard.length > 0
      ? result.scorecard
      : [
          { criterion: "OpenAPI", score: s.openapi, status: "Partial" as const, confidence: "Medium" as const, rationale: "" },
          { criterion: "Zod", score: s.zodValidation, status: "Partial" as const, confidence: "Medium" as const, rationale: "" },
          { criterion: "Rate limiting", score: s.rateLimiting, status: "Partial" as const, confidence: "Medium" as const, rationale: "" },
          { criterion: "Caching", score: s.caching, status: "Partial" as const, confidence: "Medium" as const, rationale: "" },
          { criterion: "Prisma", score: s.prismaModels, status: "Partial" as const, confidence: "Medium" as const, rationale: "" },
        ];

  const scoreLines = [
    `| Dimension | Score (0–10) |`,
    `| --- | --- |`,
    `| OpenAPI | ${s.openapi} |`,
    `| Zod validation | ${s.zodValidation} |`,
    `| Rate limiting | ${s.rateLimiting} |`,
    `| Caching | ${s.caching} |`,
    `| Prisma models | ${s.prismaModels} |`,
  ].join("\n");

  const scorecardTable = [
    `| Criterion | Score | Status | Confidence | Rationale |`,
    `| --- | --- | --- | --- | --- |`,
    ...rows.map(
      (r) =>
        `| ${escapeMdCell(r.criterion)} | ${r.score} | ${r.status} | ${r.confidence} | ${escapeMdCell(r.rationale)} |`,
    ),
  ].join("\n");

  return [
    `# Node.js backend assessment`,
    ``,
    `- **Repository:** \`${meta.repoRoot}\``,
    `- **Context bundled:** ${meta.contextChars} characters (truncated excerpts)`,
    `- **Overall score:** ${result.overallScore}/100`,
    `- **Generated:** ${when}`,
    ``,
    `## Scores`,
    ``,
    scoreLines,
    ``,
    `## Executive summary`,
    ``,
    result.executiveSummary.trim() || "_None._",
    ``,
    `## Scorecard`,
    ``,
    scorecardTable,
    ``,
    `## Findings`,
    ``,
    result.findings.length ? result.findings.map((f) => `- ${f}`).join("\n") : "_None._",
    ``,
    `## Gaps & risks`,
    ``,
    result.gapsAndRisks.length
      ? result.gapsAndRisks.map((f) => `- ${f}`).join("\n")
      : "_None._",
    ``,
    `## Next steps`,
    ``,
    result.nextSteps.length
      ? result.nextSteps.map((f, i) => `${i + 1}. ${f}`).join("\n")
      : "_None._",
    ``,
  ].join("\n");
}

function escapeMdCell(s: string): string {
  return s.replace(/\|/g, "\\|").replace(/\n/g, " ");
}
