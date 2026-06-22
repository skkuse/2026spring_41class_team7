import { createRoute, z } from '@hono/zod-openapi';

import { errorResponseSchema } from '../common/error.response.schema.js';
import { companySummarySchema } from './company.schema.js';

export const patchCompanyRoute = createRoute({
  method: 'patch',
  path: '/v1/companies/:id',
  security: [{ bearerAuth: [] }],
  request: {
    params: z.object({ id: z.string() }),
    body: {
      content: {
        'application/json': {
          schema: z.object({
            name: z.string().min(1).max(200).optional(),
            industry: z.string().max(100).optional(),
          }),
        },
      },
    },
  },
  responses: {
    200: {
      content: { 'application/json': { schema: companySummarySchema } },
      description: 'Company updated',
    },
    401: {
      content: { 'application/json': { schema: errorResponseSchema } },
      description: 'Unauthorized',
    },
    404: {
      content: { 'application/json': { schema: errorResponseSchema } },
      description: 'Not found',
    },
  },
  tags: ['Companies'],
});
