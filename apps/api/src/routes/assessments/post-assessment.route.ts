import { createRoute } from '@hono/zod-openapi';

import { errorResponseSchema } from '../common/error.response.schema.js';
import { postAssessmentBodySchema } from './post-assessment.request.schema.js';
import { postAssessmentResponse201Schema } from './post-assessment.response.schema.js';

export const postAssessmentRoute = createRoute({
  method: 'post',
  path: '/v1/assessments',
  security: [{ bearerAuth: [] }],
  request: {
    body: {
      content: {
        'application/json': {
          schema: postAssessmentBodySchema,
        },
      },
    },
  },
  responses: {
    201: {
      content: {
        'application/json': {
          schema: postAssessmentResponse201Schema,
        },
      },
      description: 'Assessment stored',
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
