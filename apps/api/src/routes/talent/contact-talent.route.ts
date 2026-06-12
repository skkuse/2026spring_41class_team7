import { createRoute, z } from '@hono/zod-openapi';

import { errorResponseSchema } from '../common/error.response.schema.js';
import { contactTalentBodySchema } from './contact-talent.request.schema.js';
import { contactTalentResponse200Schema } from './contact-talent.response.schema.js';

export const contactTalentRoute = createRoute({
  method: 'post',
  path: '/v1/talent/:userId/contact',
  security: [{ bearerAuth: [] }],
  request: {
    params: z.object({ userId: z.string() }),
    body: {
      content: { 'application/json': { schema: contactTalentBodySchema } },
      required: true,
    },
  },
  responses: {
    200: {
      content: { 'application/json': { schema: contactTalentResponse200Schema } },
      description: 'Email sent',
    },
    401: {
      content: { 'application/json': { schema: errorResponseSchema } },
      description: 'Unauthorized',
    },
    403: {
      content: { 'application/json': { schema: errorResponseSchema } },
      description: 'Forbidden',
    },
    503: {
      content: { 'application/json': { schema: errorResponseSchema } },
      description: 'Email service unavailable',
    },
  },
  tags: ['Talent'],
});
