import { createRoute } from '@hono/zod-openapi';

import { errorResponseSchema } from '../common/error.response.schema.js';
import { postPortfolioSaveRequestSchema } from './post-save.request.schema.js';
import { postPortfolioSaveResponseSchema } from './post-save.response.schema.js';

export const postPortfolioSaveRoute = createRoute({
  method: 'post',
  path: '/v1/portfolio/save',
  summary: 'Save portfolio sections as a Document record',
  security: [{ bearerAuth: [] }],
  request: {
    body: {
      content: {
        'application/json': { schema: postPortfolioSaveRequestSchema },
      },
    },
  },
  responses: {
    200: {
      description: 'Document created',
      content: { 'application/json': { schema: postPortfolioSaveResponseSchema } },
    },
    400: { description: 'Bad request', content: { 'application/json': { schema: errorResponseSchema } } },
    401: { description: 'Unauthorized', content: { 'application/json': { schema: errorResponseSchema } } },
    404: { description: 'Profile not found', content: { 'application/json': { schema: errorResponseSchema } } },
  },
  tags: ['Portfolio'],
});
