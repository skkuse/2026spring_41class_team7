import { createRoute, z } from '@hono/zod-openapi';

import { errorResponseSchema } from '../common/error.response.schema.js';

export const deleteShortlistRoute = createRoute({
  method: 'delete',
  path: '/v1/shortlist/:devUserId',
  security: [{ bearerAuth: [] }],
  request: {
    params: z.object({ devUserId: z.string() }),
  },
  responses: {
    200: {
      content: { 'application/json': { schema: z.object({ removed: z.boolean() }) } },
      description: 'Developer removed from shortlist',
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
