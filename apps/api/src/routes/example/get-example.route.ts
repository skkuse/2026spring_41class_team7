import { createRoute } from '@hono/zod-openapi';

import { getExampleQuerySchema } from './get-example.request.schema.js';
import { getExampleResponse200Schema } from './get-example.response.schema.js';

export const getExampleRoute = createRoute({
  method: 'get',
  path: '/example',
  request: {
    query: getExampleQuerySchema,
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: getExampleResponse200Schema,
        },
      },
      description: 'Successful example response',
    },
  },
  tags: ['Example'],
});
