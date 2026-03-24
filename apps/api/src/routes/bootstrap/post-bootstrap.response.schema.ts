
import { z } from '@hono/zod-openapi';

export const bootstrapResponse200Schema = z.object({
  profileCreated: z.boolean().openapi({ example: true }),
  documentsCreated: z.number().int().openapi({ example: 3 }),
  invoicesCreated: z.number().int().openapi({ example: 2 }),
});
