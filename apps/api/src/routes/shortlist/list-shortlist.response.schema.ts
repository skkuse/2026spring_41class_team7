import { z } from '@hono/zod-openapi';

export const shortlistItemSchema = z.object({
  devUserId: z.string(),
  fullName: z.string(),
  role: z.string(),
  location: z.string(),
  website: z.string().nullable(),
  bestScore: z.number().int().nullable(),
  shortlistedAt: z.string(),
});

export const listShortlistResponse200Schema = z.object({
  items: z.array(shortlistItemSchema),
  total: z.number().int(),
});
