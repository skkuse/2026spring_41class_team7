import { z } from '@hono/zod-openapi';

export const patchDocumentResponse200Schema = z.object({
  id: z.string(),
  name: z.string(),
});
