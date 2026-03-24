
import { z } from '@hono/zod-openapi';

export const errorResponseSchema = z.object({
  message: z.string().openapi({ example: 'Unauthorized token.' }),
});
