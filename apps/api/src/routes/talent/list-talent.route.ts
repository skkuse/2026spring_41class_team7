import { createRoute } from '@hono/zod-openapi';

import { errorResponseSchema } from '../common/error.response.schema.js';
import { listTalentResponse200Schema } from './list-talent.response.schema.js';

export const listTalentRoute = createRoute({
  method: 'get',
  path: '/v1/talent',
  security: [{ bearerAuth: [] }],
  responses: {
    200: {
      content: { 'application/json': { schema: listTalentResponse200Schema } },
      description: 'List of developers sorted by best assessment score',
    },
    401: {
      content: { 'application/json': { schema: errorResponseSchema } },
      description: 'Unauthorized',
    },
  },
  tags: ['Talent'],
});
