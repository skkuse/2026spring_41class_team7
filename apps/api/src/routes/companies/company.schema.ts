import { z } from '@hono/zod-openapi';

export const companySummarySchema = z.object({
  id: z.string(),
  name: z.string(),
  industry: z.string().nullable(),
  createdAt: z.string().datetime(),
});
