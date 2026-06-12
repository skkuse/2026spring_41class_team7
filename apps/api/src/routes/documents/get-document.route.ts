import { createRoute, z } from '@hono/zod-openapi';

import { errorResponseSchema } from '../common/error.response.schema.js';
import { getDocumentResponse200Schema } from './get-document.response.schema.js';

export const getDocumentRoute = createRoute({
  method: 'get',
  path: '/v1/documents/:id',
  security: [{ bearerAuth: [] }],
  request: {
    params: z.object({ id: z.string() }),
  },
  responses: {
    200: {
      content: { 'application/json': { schema: getDocumentResponse200Schema } },
      description: 'Document with sections',
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
  tags: ['Documents'],
});
