import { getOpenAiApiKey } from "./credentials.js";

export type EvaluationPromptPayload = {
  prompt: string;
  criteria: string[];
};

export type ChecklistItem = {
  id: string;
  label: string;
  status: "done" | "not_done";
};

export type Agent2Result = {
  promptSource: "server" | "fallback";
  scores: Record<string, number>;
  checklist: ChecklistItem[];
  rawModelResponse?: string;
};

const FALLBACK_PROMPT: EvaluationPromptPayload = {
  prompt:
    "Evaluate the repository for clarity of structure, presence of tests, and documentation. Score each dimension from 0 to 10.",
  criteria: ["structure", "tests", "documentation", "dependencies_hygiene"],
};

export async function fetchEvaluationPrompt(
  baseUrl: string,
): Promise<{ payload: EvaluationPromptPayload; source: "server" | "fallback" }> {
  const url = `${baseUrl.replace(/\/$/, "")}/evaluation-prompt`;
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(8_000) });
    if (!res.ok) throw new Error(String(res.status));
    const data = (await res.json()) as EvaluationPromptPayload;
    if (!data.prompt || !Array.isArray(data.criteria)) throw new Error("invalid shape");
    return { payload: data, source: "server" };
  } catch {
    return { payload: FALLBACK_PROMPT, source: "fallback" };
  }
}

function mockAgent2(payload: EvaluationPromptPayload): Agent2Result {
  const checklist: ChecklistItem[] = payload.criteria.map((c, i) => ({
    id: `c${i + 1}`,
    label: c,
    status: "not_done" as const,
  }));
  const scores: Record<string, number> = {};
  for (const c of payload.criteria) scores[c] = 0;
  return {
    promptSource: "fallback",
    scores,
    checklist,
  };
}

export async function runAgent2Evaluation(
  payload: EvaluationPromptPayload,
  source: "server" | "fallback",
  sourceContext: string,
): Promise<Agent2Result> {
  const apiKey = getOpenAiApiKey();
  if (!apiKey) {
    const m = mockAgent2(payload);
    return { ...m, promptSource: source };
  }

  const system = `You are Jobclaw's evaluation agent. Respond with ONLY valid JSON (no markdown) matching this shape:
{"scores":{<criterion:string>: number 0-10}, "checklist":[{"id":string,"label":string,"status":"done"|"not_done"}]}
Use the criteria names from the user message as score keys and checklist labels where appropriate.`;

  const user = `Evaluation instructions:\n${payload.prompt}\n\nCriteria: ${payload.criteria.join(", ")}\n\n--- Repository files (truncated) ---\n${sourceContext}`;

  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: process.env.JOBCLAW_OPENAI_MODEL ?? "gpt-4o-mini",
        temperature: 0.2,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: system },
          { role: "user", content: user.slice(0, 100_000) },
        ],
      }),
      signal: AbortSignal.timeout(120_000),
    });
    if (!res.ok) {
      const t = await res.text();
      throw new Error(t || res.statusText);
    }
    const data = (await res.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    const content = data.choices?.[0]?.message?.content;
    if (!content) throw new Error("empty completion");
    const parsed = JSON.parse(content) as {
      scores?: Record<string, number>;
      checklist?: ChecklistItem[];
    };
    const checklist = Array.isArray(parsed.checklist)
      ? parsed.checklist.map((c, i) => ({
          id: c.id ?? `c${i + 1}`,
          label: String(c.label ?? ""),
          status: c.status === "done" ? ("done" as const) : ("not_done" as const),
        }))
      : [];
    const scores = parsed.scores && typeof parsed.scores === "object" ? parsed.scores : {};
    return {
      promptSource: source,
      scores,
      checklist,
      rawModelResponse: content,
    };
  } catch {
    const m = mockAgent2(payload);
    return { ...m, promptSource: source };
  }
}
