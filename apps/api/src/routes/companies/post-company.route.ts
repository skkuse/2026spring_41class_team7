import { createRoute, z } from '@hono/zod-openapi';

import { errorResponseSchema } from '../common/error.response.schema.js';
import { companySummarySchema } from './company.schema.js';

export const postCompanyRoute = createRoute({
  method: 'post',
  path: '/v1/companies',
  security: [{ bearerAuth: [] }],
  request: {
    body: {
      content: {
        'application/json': {
          schema: z.object({
            name: z.string().min(1).max(200),
            industry: z.string().max(100).optional(),
          }),
        },
      },
    },
  },
  responses: {
    201: {
      content: { 'application/json': { schema: companySummarySchema } },
      description: 'Company created',
    },
    401: {
      content: { 'application/json': { schema: errorResponseSchema } },
      description: 'Unauthorized',
    },
  },
  tags: ['Companies'],
});
