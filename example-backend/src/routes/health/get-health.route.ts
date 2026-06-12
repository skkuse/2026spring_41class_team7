import { createRoute, z } from '@hono/zod-openapi';

export const getHealthRoute = createRoute({
  method: 'get',
  path: '/health',
  tags: ['System'],
  summary: 'Health check',
  responses: {
    200: {
      content: {
        'application/json': {
          schema: z.object({ status: z.literal('ok'), uptime: z.number() }),
        },
      },
      description: 'Service is healthy',
    },
  },
});
