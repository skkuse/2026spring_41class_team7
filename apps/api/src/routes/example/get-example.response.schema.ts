import { z } from '@hono/zod-openapi';

export const getExampleResponse200Schema = z.object({
  message: z.string().openapi({
    description: 'Greeting message',
    example: 'Hello, Team 7!',
  }),
});
