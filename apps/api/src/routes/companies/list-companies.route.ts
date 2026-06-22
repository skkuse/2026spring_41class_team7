import { createRoute, z } from '@hono/zod-openapi';

import { errorResponseSchema } from '../common/error.response.schema.js';
import { companySummarySchema } from './company.schema.js';

export const listCompaniesRoute = createRoute({
  method: 'get',
  path: '/v1/companies',
  security: [{ bearerAuth: [] }],
  responses: {
    200: {
      content: {
        'application/json': {
          schema: z.object({ companies: z.array(companySummarySchema) }),
        },
      },
      description: 'List of user companies',
    },
    401: {
      content: { 'application/json': { schema: errorResponseSchema } },
      description: 'Unauthorized',
    },
  },
  tags: ['Companies'],
});
