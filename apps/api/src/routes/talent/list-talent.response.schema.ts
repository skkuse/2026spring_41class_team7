import { z } from '@hono/zod-openapi';

export const talentSummarySchema = z.object({
  userId: z.string(),
  fullName: z.string(),
  role: z.string(),
  location: z.string(),
  website: z.string().nullable(),
  allowContact: z.boolean(),
  bestScore: z.number().int(),
  assessmentCount: z.number().int(),
  isShortlisted: z.boolean(),
});

export const listTalentResponse200Schema = z.object({
  items: z.array(talentSummarySchema),
  total: z.number().int(),
});
