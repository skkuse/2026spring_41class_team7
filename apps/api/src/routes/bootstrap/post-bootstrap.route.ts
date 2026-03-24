
import { createRoute } from '@hono/zod-openapi';

import { errorResponseSchema } from '../common/error.response.schema.js';
import { bootstrapResponse200Schema } from './post-bootstrap.response.schema.js';

export const postBootstrapRoute = createRoute({
  method: 'post',
  path: '/v1/bootstrap',
  security: [{ bearerAuth: [] }],
  responses: {
    200: {
      content: {
        'application/json': {
          schema: bootstrapResponse200Schema,
        },
      },
      description: 'Bootstrap mock records for authenticated user',
    },
    401: {
      content: {
        'application/json': {
          schema: errorResponseSchema,
        },
      },
      description: 'Unauthorized',
    },
  },
  tags: ['Bootstrap'],
});
