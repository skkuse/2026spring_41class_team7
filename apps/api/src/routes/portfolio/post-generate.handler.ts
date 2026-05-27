import type { RouteHandler } from '@hono/zod-openapi';

import type { Env } from '../../types.js';
import { prisma } from '../../lib/prisma.js';
import { getOpenAI, getOpenAIModel } from '../../lib/openai-client.js';
import type { PortfolioSection } from './post-generate.response.schema.js';
import { postPortfolioGenerateRoute } from './post-generate.route.js';

const SYSTEM_PROMPT = `You write compelling portfolio entries for software engineers. Given a repository assessment (scores, findings, gaps, next steps, and tech context), return ONE valid JSON object — no markdown, no extra text — with this exact shape:
{
  "headline": string,
  "summary": string,
  "role": string,
  "duration": string,
  "techStack": string[],
  "highlights": [{ "title": string, "description": string }],
  "impact": string
}
Rules:
- headline: 8–14 words, punchy, past-tense, highlight the key achievement
- summary: 2–3 sentences in first person — what was built, why, and key decisions
- role: inferred engineering role (e.g. "Lead Backend Engineer", "Full-Stack Developer")
- duration: estimated from context (e.g. "~6 months", "Ongoing") — never leave blank
- techStack: 4–7 most significant technologies present in the assessment
- highlights: exactly 3–4 items; title ≤ 8 words; description 1–2 sentences of concrete detail
- impact: 1–2 sentences of measurable or qualitative outcome; be specific
Write confidently and specifically. Avoid vague superlatives.`;

function parseJson(raw: string): unknown {
  const s = raw.indexOf('{');
  const e = raw.lastIndexOf('}');
  if (s === -1 || e <= s) throw new Error('No JSON object found.');
  return JSON.parse(raw.slice(s, e + 1));
}

async function generateSection(
  openai: ReturnType<typeof getOpenAI>,
  model: string,
  assessment: {
    id: string;
    repoOwner: string;
    repoName: string;
    overallScore: number;
    assessmentType: string;
    executiveSummary: string;
    scores: unknown;
    findings: string[];
    gapsAndRisks: string[];
    nextSteps: string[];
    scorecard: unknown;
  },
): Promise<PortfolioSection> {
  const context = {
    repo: `${assessment.repoOwner}/${assessment.repoName}`,
    assessmentType: assessment.assessmentType,
    overallScore: assessment.overallScore,
    executiveSummary: assessment.executiveSummary,
    scores: assessment.scores,
    findings: assessment.findings,
    gapsAndRisks: assessment.gapsAndRisks,
    nextSteps: assessment.nextSteps,
    scorecard: assessment.scorecard,
  };

  const completion = await openai.chat.completions.create({
    model,
    temperature: 0.4,
    response_format: { type: 'json_object' },
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: JSON.stringify(context) },
    ],
  });

  const raw = completion.choices[0]?.message?.content ?? '';
  const parsed = parseJson(raw) as Record<string, unknown>;

  return {
    assessmentId: assessment.id,
    repoOwner: assessment.repoOwner,
    repoName: assessment.repoName,
    overallScore: assessment.overallScore,
    headline: String(parsed.headline ?? ''),
    summary: String(parsed.summary ?? ''),
    role: String(parsed.role ?? ''),
    duration: String(parsed.duration ?? ''),
    techStack: Array.isArray(parsed.techStack)
      ? (parsed.techStack as unknown[]).map(String)
      : [],
    highlights: Array.isArray(parsed.highlights)
      ? (parsed.highlights as Array<Record<string, unknown>>).map((h) => ({
          title: String(h.title ?? ''),
          description: String(h.description ?? ''),
        }))
      : [],
    impact: String(parsed.impact ?? ''),
  };
}

export const postPortfolioGenerateHandler: RouteHandler<
  typeof postPortfolioGenerateRoute,
  Env
> = async (c) => {
  const userId = c.get('userId');
  const { assessmentIds } = c.req.valid('json');

  let openai: ReturnType<typeof getOpenAI>;
  try {
    openai = getOpenAI();
  } catch {
    return c.json({ message: 'OpenAI is not configured on the server.' }, 503);
  }

  const model = getOpenAIModel();

  // Fetch all assessments in one query, verify ownership
  const rows = await prisma.assessment.findMany({
    where: { id: { in: assessmentIds }, userId },
    select: {
      id: true,
      repoOwner: true,
      repoName: true,
      overallScore: true,
      assessmentType: true,
      executiveSummary: true,
      scores: true,
      findings: true,
      gapsAndRisks: true,
      nextSteps: true,
      scorecard: true,
    },
  });

  // Preserve the requested order
  const ordered = assessmentIds
    .map((id) => rows.find((r) => r.id === id))
    .filter(Boolean) as typeof rows;

  // Generate all sections in parallel
  let sections: PortfolioSection[];
  try {
    sections = await Promise.all(
      ordered.map((row) => generateSection(openai, model, row)),
    );
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'OpenAI request failed.';
    return c.json({ message: msg }, 502);
  }

  return c.json({ sections }, 200);
};
