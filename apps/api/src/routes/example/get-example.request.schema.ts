import { z } from '@hono/zod-openapi';

export const getExampleQuerySchema = z.object({
  name: z
    .string()
    .min(1)
    .openapi({
      description: 'Optional name to personalize the greeting',
      example: 'Team 7',
    })
    .optional(),
});
