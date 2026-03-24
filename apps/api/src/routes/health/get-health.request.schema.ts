import { z } from '@hono/zod-openapi';

export const getHealthQuerySchema = z.object({
  fail: z
    .enum(['true', 'false'])
    .openapi({
      description: 'Set fail=true to simulate an unhealthy dependency',
      example: 'false',
    })
    .optional(),
});
