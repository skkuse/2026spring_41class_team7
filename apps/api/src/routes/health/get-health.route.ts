import { createRoute } from '@hono/zod-openapi';

import { getHealthQuerySchema } from './get-health.request.schema.js';
import {
  getHealthResponse200Schema,
  getHealthResponse503Schema,
} from './get-health.response.schema.js';

export const getHealthRoute = createRoute({
  method: 'get',
  path: '/health',
  request: {
    query: getHealthQuerySchema,
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: getHealthResponse200Schema,
        },
      },
      description: 'Service is healthy',
    },
    503: {
      content: {
        'application/json': {
          schema: getHealthResponse503Schema,
        },
      },
      description: 'Service dependency is unhealthy',
    },
  },
  tags: ['Health'],
});
