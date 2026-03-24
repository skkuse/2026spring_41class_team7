import { z } from '@hono/zod-openapi';

export const getHealthResponse200Schema = z.object({
  status: z.literal('ok').openapi({ example: 'ok' }),
  service: z.string().openapi({ example: 'api' }),
});

export const getHealthResponse503Schema = z.object({
  status: z.literal('error').openapi({ example: 'error' }),
  message: z.string().openapi({ example: 'Database is unavailable' }),
});
