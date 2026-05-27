import { createRoute, z } from '@hono/zod-openapi';

import { errorResponseSchema } from '../common/error.response.schema.js';
import { getTalentResponse200Schema } from './get-talent.response.schema.js';

export const getTalentRoute = createRoute({
  method: 'get',
  path: '/v1/talent/:userId',
  security: [{ bearerAuth: [] }],
  request: {
    params: z.object({ userId: z.string() }),
  },
  responses: {
    200: {
      content: { 'application/json': { schema: getTalentResponse200Schema } },
      description: 'Developer profile with assessments',
    },
    401: {
      content: { 'application/json': { schema: errorResponseSchema } },
      description: 'Unauthorized',
    },
    404: {
      content: { 'application/json': { schema: errorResponseSchema } },
      description: 'Developer not found',
    },
  },
  tags: ['Talent'],
});
