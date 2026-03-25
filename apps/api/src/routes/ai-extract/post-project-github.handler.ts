import type { RouteHandler } from '@hono/zod-openapi';

import type { Env } from '../../types.js';
import { fetchGithubRepoSnapshot, GithubFetchError } from '../../lib/github-repo-metadata.js';
import { getOpenAI, getOpenAIModel } from '../../lib/openai-client.js';
import { ProjectTechProfileSchema } from '../ai-extract.schema.js';
import { postProjectGithubRoute } from './post-project-github.route.js';

const PROJECT_JSON_INSTRUCTION = `You infer a project's tech stack from GitHub metadata. Return ONE JSON object only (no markdown) with:
{
  "primaryLanguages": string[],
  "frameworksLibraries": string[],
  "runtimePlatforms": string[],
  "databasesStorage": string[],
  "infraDevops": string[],
  "testingQuality": string[],
  "otherNotable"?: string[],
  "summary"?: string,
  "confidence": number
}
Use the provided GitHub language byte counts and topics as strong signals; readme excerpt for hints. Do not invent repos; if uncertain, lower confidence and keep arrays minimal.`;

function parseJsonObject(raw: string): unknown {
  const trimmed = raw.trim();
  const start = trimmed.indexOf('{');
  const end = trimmed.lastIndexOf('}');
  if (start === -1 || end === -1 || end <= start) {
    throw new Error('Model did not return a JSON object.');
  }
  return JSON.parse(trimmed.slice(start, end + 1)) as unknown;
}

export const postProjectGithubHandler: RouteHandler<typeof postProjectGithubRoute, Env> = async (c) => {
  const body = c.req.valid('json');

  let snapshot;
  try {
    snapshot = await fetchGithubRepoSnapshot(body.repoUrl);
  } catch (e) {
    if (e instanceof GithubFetchError) {
      return c.json({ message: e.message }, e.status);
    }
    throw e;
  }

  let openai;
  try {
    openai = getOpenAI();
  } catch {
    return c.json({ message: 'OpenAI is not configured on the server.' }, 503);
  }

  const context = {
    htmlUrl: snapshot.htmlUrl,
    description: snapshot.description,
    defaultBranch: snapshot.defaultBranch,
    languageBytes: snapshot.languages,
    topics: snapshot.topics,
    readmeExcerpt: snapshot.readmeExcerpt,
  };

  let completion;
  try {
    completion = await openai.chat.completions.create({
      model: getOpenAIModel(),
      temperature: 0.2,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: PROJECT_JSON_INSTRUCTION },
        { role: 'user', content: JSON.stringify(context) },
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

  const techResult = ProjectTechProfileSchema.safeParse(parsed);
  if (!techResult.success) {
    return c.json({ message: 'Model output failed validation.' }, 502);
  }

  return c.json(
    {
      repoUrl: body.repoUrl.trim(),
      github: {
        owner: snapshot.owner,
        repo: snapshot.repo,
        description: snapshot.description,
        defaultBranch: snapshot.defaultBranch,
        languageBytes: snapshot.languages,
        topics: snapshot.topics,
      },
      tech: techResult.data,
    },
    200,
  );
};
