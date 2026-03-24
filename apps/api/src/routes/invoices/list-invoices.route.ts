
import { createRoute } from '@hono/zod-openapi';

import { errorResponseSchema } from '../common/error.response.schema.js';
import { listInvoicesQuerySchema } from './list-invoices.request.schema.js';
import { listInvoicesResponse200Schema } from './list-invoices.response.schema.js';

export const listInvoicesRoute = createRoute({
  method: 'get',
  path: '/v1/invoices',
  request: {
    query: listInvoicesQuerySchema,
  },
  security: [{ bearerAuth: [] }],
  responses: {
    200: {
      content: {
        'application/json': {
          schema: listInvoicesResponse200Schema,
        },
      },
      description: 'Paginated invoices',
    },
    401: {
      content: {
        'application/json': {
          schema: errorResponseSchema,
        },
      },
      description: 'Unauthorized',
    },
    404: {
      content: {
        'application/json': {
          schema: errorResponseSchema,
        },
      },
      description: 'Profile not found',
    },
  },
  tags: ['Billing'],
});
