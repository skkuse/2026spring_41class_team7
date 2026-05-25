import { createRoute, z } from '@hono/zod-openapi';

import { errorResponseSchema } from '../common/error.response.schema.js';
import { getAssessmentResponse200Schema } from './get-assessment.response.schema.js';

export const getAssessmentRoute = createRoute({
  method: 'get',
  path: '/v1/assessments/:id',
  security: [{ bearerAuth: [] }],
  request: {
    params: z.object({ id: z.string() }),
  },
  responses: {
    200: {
      content: {
        'application/json': { schema: getAssessmentResponse200Schema },
      },
      description: 'Assessment detail',
    },
    404: {
      content: {
        'application/json': { schema: errorResponseSchema },
      },
      description: 'Not found',
    },
    401: {
      content: {
        'application/json': { schema: errorResponseSchema },
      },
      description: 'Unauthorized',
    },
  },
  tags: ['Assessments'],
});
