import type { RouteHandler } from '@hono/zod-openapi';

import type { Env } from '../../types.js';
import { DocumentExtractError, extractTextFromResumeBuffer, truncateForModel } from '../../lib/extract-document-text.js';
import { getOpenAI, getOpenAIModel } from '../../lib/openai-client.js';
import { ResumeProfileSchema } from '../ai-extract.schema.js';
import { postResumeParseRoute } from './post-resume-parse.route.js';

const RESUME_JSON_INSTRUCTION = `You are a resume parser. Given plain text extracted from a resume, return ONE JSON object only (no markdown) with this shape:
{
  "fullName": string|null,
  "headline": string|null,
  "summary": string|null,
  "location": string|null,
  "email": string|null,
  "phone": string|null,
  "links": string[],
  "yearsExperience": number|null,
  "keySkills": string[],
  "skillCategories": { "name": string, "skills": string[] }[],
  "languagesHuman": string[],
  "certifications": string[],
  "education": { "institution"?: string, "degree"?: string, "field"?: string, "endYear"?: string|number }[],
  "workHistory": { "company"?: string, "title"?: string, "start"?: string, "end"?: string, "highlights"?: string[] }[],
  "confidence": number,
  "notes"?: string
}
Rules: keySkills = deduped technical/professional skills (tools, languages, frameworks, domains). languagesHuman = spoken languages if mentioned, not programming languages. Use empty arrays where unknown. confidence 0-1 for extraction quality.`;

function parseJsonObject(raw: string): unknown {
  const trimmed = raw.trim();
  const start = trimmed.indexOf('{');
  const end = trimmed.lastIndexOf('}');
  if (start === -1 || end === -1 || end <= start) {
    throw new Error('Model did not return a JSON object.');
  }
  return JSON.parse(trimmed.slice(start, end + 1)) as unknown;
}

export const postResumeParseHandler: RouteHandler<typeof postResumeParseRoute, Env> = async (c) => {
  const body = c.req.valid('json');

  let buffer: Buffer;
  try {
    buffer = Buffer.from(body.fileBase64, 'base64');
  } catch {
    return c.json({ message: 'Invalid base64.' }, 400);
  }

  let extracted: { text: string; detectedKind: 'pdf' | 'docx' };
  try {
    extracted = await extractTextFromResumeBuffer(buffer, body.fileName);
  } catch (e) {
    if (e instanceof DocumentExtractError) {
      return c.json({ message: e.message }, e.status);
    }
    throw e;
  }

  const { text: modelInput, truncated } = truncateForModel(extracted.text, 48_000);

  let openai;
  try {
    openai = getOpenAI();
  } catch {
    return c.json({ message: 'OpenAI is not configured on the server.' }, 503);
  }

  let completion;
  try {
    completion = await openai.chat.completions.create({
      model: getOpenAIModel(),
      temperature: 0.2,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: RESUME_JSON_INSTRUCTION },
        {
          role: 'user',
          content: `fileName: ${body.fileName}\n\nResume text:\n${modelInput}`,
        },
      ],
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'OpenAI request failed.';
    return c.json({ message: msg }, 502);
  }

  const raw = completion.choices[0]?.message?.content;
  if (!raw) {
    return c.json({ message: 'OpenAI returned empty content.' }, 502);
  }

  let parsed: unknown;
  try {
    parsed = parseJsonObject(raw);
  } catch {
    return c.json({ message: 'Failed to parse model JSON.' }, 502);
  }

  const profileResult = ResumeProfileSchema.safeParse(parsed);
  if (!profileResult.success) {
    return c.json({ message: 'Model output failed validation.' }, 502);
  }

  return c.json(
    {
      detectedKind: extracted.detectedKind,
      truncated,
      profile: profileResult.data,
    },
    200,
  );
};
