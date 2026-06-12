import { z } from '@hono/zod-openapi';

export const patchMeBodySchema = z.object({
  userType: z.enum(['DEVELOPER', 'COMPANY']).optional(),
  companyName: z.string().min(1).max(200).optional(),
  industry: z.string().max(100).optional(),
  allowContact: z.boolean().optional(),
});
