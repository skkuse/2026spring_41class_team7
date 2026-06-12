import { z } from '@hono/zod-openapi';

export const contactTalentResponse200Schema = z.object({
  sent: z.boolean(),
});
