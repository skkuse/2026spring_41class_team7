import { createRoute } from '@hono/zod-openapi';

import { errorResponseSchema } from '../common/error.response.schema.js';
import { postPortfolioGenerateBodySchema } from './post-generate.request.schema.js';
import { postPortfolioGenerateResponse200Schema } from './post-generate.response.schema.js';

export const postPortfolioGenerateRoute = createRoute({
  method: 'post',
  path: '/v1/portfolio/generate',
  summary: 'Generate structured portfolio sections from assessments (OpenAI)',
  security: [{ bearerAuth: [] }],
  request: {
    body: {
      content: {
        'application/json': { schema: postPortfolioGenerateBodySchema },
      },
    },
  },
  responses: {
    200: {
      description: 'Generated portfolio sections',
      content: { 'application/json': { schema: postPortfolioGenerateResponse200Schema } },
    },
    400: { description: 'Bad request', content: { 'application/json': { schema: errorResponseSchema } } },
    401: { description: 'Unauthorized', content: { 'application/json': { schema: errorResponseSchema } } },
    503: { description: 'OpenAI not configured', content: { 'application/json': { schema: errorResponseSchema } } },
    502: { description: 'Upstream error', content: { 'application/json': { schema: errorResponseSchema } } },
  },
  tags: ['Portfolio'],
});
