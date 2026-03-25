import { createRoute } from '@hono/zod-openapi';

import { errorResponseSchema } from '../common/error.response.schema.js';
import { ProjectGithubAnalyzeRequestSchema, ProjectGithubAnalyzeResponseSchema } from '../ai-extract.schema.js';

export const postProjectGithubRoute = createRoute({
  method: 'post',
  path: '/v1/projects/analyze-github',
  summary: 'Fetch GitHub repo metadata and infer tech stack JSON (OpenAI)',
  security: [{ bearerAuth: [] }],
  request: {
    body: {
      content: {
        'application/json': {
          schema: ProjectGithubAnalyzeRequestSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: 'GitHub snapshot + inferred tech',
      content: { 'application/json': { schema: ProjectGithubAnalyzeResponseSchema } },
    },
    400: {
      description: 'Bad request',
      content: { 'application/json': { schema: errorResponseSchema } },
    },
    401: {
      description: 'Unauthorized',
      content: { 'application/json': { schema: errorResponseSchema } },
    },
    404: {
      description: 'Repository not found',
      content: { 'application/json': { schema: errorResponseSchema } },
    },
    500: {
      description: 'Server error',
      content: { 'application/json': { schema: errorResponseSchema } },
    },
    502: {
      description: 'Upstream error',
      content: { 'application/json': { schema: errorResponseSchema } },
    },
    503: {
      description: 'OpenAI not configured',
      content: { 'application/json': { schema: errorResponseSchema } },
    },
  },
  tags: ['AI'],
});
