import { createRoute } from '@hono/zod-openapi';

import { errorResponseSchema } from '../common/error.response.schema.js';
import { postShortlistBodySchema } from './post-shortlist.request.schema.js';

export const postShortlistRoute = createRoute({
  method: 'post',
  path: '/v1/shortlist',
  security: [{ bearerAuth: [] }],
  request: {
    body: {
      content: { 'application/json': { schema: postShortlistBodySchema } },
      required: true,
    },
  },
  responses: {
    200: {
      content: { 'application/json': { schema: postShortlistBodySchema } },
      description: 'Developer added to shortlist',
    },
    401: {
      content: { 'application/json': { schema: errorResponseSchema } },
      description: 'Unauthorized',
    },
    403: {
      content: { 'application/json': { schema: errorResponseSchema } },
      description: 'Forbidden',
    },
  },
  tags: ['Shortlist'],
});
