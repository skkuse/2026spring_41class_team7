import { createRoute } from '@hono/zod-openapi';

import { errorResponseSchema } from '../common/error.response.schema.js';
import { listShortlistResponse200Schema } from './list-shortlist.response.schema.js';

export const listShortlistRoute = createRoute({
  method: 'get',
  path: '/v1/shortlist',
  security: [{ bearerAuth: [] }],
  responses: {
    200: {
      content: { 'application/json': { schema: listShortlistResponse200Schema } },
      description: "Company's shortlisted developers",
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
