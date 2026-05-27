import { z } from '@hono/zod-openapi';

export const contactTalentBodySchema = z.object({
  message: z.string().min(10).max(2000),
});
