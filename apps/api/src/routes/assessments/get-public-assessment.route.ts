import { createRoute, z } from '@hono/zod-openapi';

import { errorResponseSchema } from '../common/error.response.schema.js';
import { getAssessmentResponse200Schema } from './get-assessment.response.schema.js';

export const getPublicAssessmentRoute = createRoute({
  method: 'get',
  path: '/assessments/:owner/:repo',
  request: {
    params: z.object({ owner: z.string(), repo: z.string() }),
  },
  responses: {
    200: {
      content: {
        'application/json': { schema: getAssessmentResponse200Schema },
      },
      description: 'Latest public assessment for repo',
    },
    404: {
      content: {
        'application/json': { schema: errorResponseSchema },
      },
      description: 'Not found',
    },
  },
  tags: ['Assessments'],
});
