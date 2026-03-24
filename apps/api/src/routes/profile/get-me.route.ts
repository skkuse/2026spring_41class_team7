
import { createRoute } from '@hono/zod-openapi';

import { errorResponseSchema } from '../common/error.response.schema.js';
import { meResponse200Schema } from './get-me.response.schema.js';

export const getMeRoute = createRoute({
  method: 'get',
  path: '/v1/me',
  security: [{ bearerAuth: [] }],
  responses: {
    200: {
      content: {
        'application/json': {
          schema: meResponse200Schema,
        },
      },
      description: 'Current authenticated profile',
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
  tags: ['Profile'],
});
