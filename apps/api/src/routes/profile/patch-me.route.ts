import { createRoute } from '@hono/zod-openapi';

import { errorResponseSchema } from '../common/error.response.schema.js';
import { patchMeBodySchema } from './patch-me.request.schema.js';
import { patchMeResponse200Schema } from './patch-me.response.schema.js';

export const patchMeRoute = createRoute({
  method: 'patch',
  path: '/v1/me',
  security: [{ bearerAuth: [] }],
  request: {
    body: {
      content: { 'application/json': { schema: patchMeBodySchema } },
      required: true,
    },
  },
  responses: {
    200: {
      content: { 'application/json': { schema: patchMeResponse200Schema } },
      description: 'Profile updated',
    },
    401: {
      content: { 'application/json': { schema: errorResponseSchema } },
      description: 'Unauthorized',
    },
    404: {
      content: { 'application/json': { schema: errorResponseSchema } },
      description: 'Profile not found',
    },
  },
  tags: ['Profile'],
});
