
import { createRoute } from '@hono/zod-openapi';

import { errorResponseSchema } from '../common/error.response.schema.js';
import { listDocumentsQuerySchema } from './list-documents.request.schema.js';
import { listDocumentsResponse200Schema } from './list-documents.response.schema.js';

export const listDocumentsRoute = createRoute({
  method: 'get',
  path: '/v1/documents',
  request: {
    query: listDocumentsQuerySchema,
  },
  security: [{ bearerAuth: [] }],
  responses: {
    200: {
      content: {
        'application/json': {
          schema: listDocumentsResponse200Schema,
        },
      },
      description: 'Paginated documents',
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
  tags: ['Documents'],
});
