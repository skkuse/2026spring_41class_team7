import { createRoute } from '@hono/zod-openapi';

import { errorResponseSchema } from '../common/error.response.schema.js';
import { listAssessmentsResponse200Schema } from './list-assessments.response.schema.js';

export const listAssessmentsRoute = createRoute({
  method: 'get',
  path: '/v1/assessments',
  security: [{ bearerAuth: [] }],
  responses: {
    200: {
      content: {
        'application/json': {
          schema: listAssessmentsResponse200Schema,
        },
      },
      description: 'User assessments',
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
  tags: ['Assessments'],
});
