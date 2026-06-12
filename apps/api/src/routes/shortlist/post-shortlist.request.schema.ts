import { z } from '@hono/zod-openapi';

export const postShortlistBodySchema = z.object({
  devUserId: z.string(),
});
