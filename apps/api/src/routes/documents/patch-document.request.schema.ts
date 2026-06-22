import { z } from '@hono/zod-openapi';

export const patchDocumentParamsSchema = z.object({ id: z.string() });

export const patchDocumentBodySchema = z.object({
  name: z.string().min(1).max(200),
});
