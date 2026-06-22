import { createRoute } from '@hono/zod-openapi';

import { errorResponseSchema } from '../common/error.response.schema.js';
import { patchDocumentBodySchema, patchDocumentParamsSchema } from './patch-document.request.schema.js';
import { patchDocumentResponse200Schema } from './patch-document.response.schema.js';

export const patchDocumentRoute = createRoute({
  method: 'patch',
  path: '/v1/documents/:id',
  security: [{ bearerAuth: [] }],
  request: {
    params: patchDocumentParamsSchema,
    body: {
      content: { 'application/json': { schema: patchDocumentBodySchema } },
      required: true,
    },
  },
  responses: {
    200: {
      content: { 'application/json': { schema: patchDocumentResponse200Schema } },
      description: 'Document updated',
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
