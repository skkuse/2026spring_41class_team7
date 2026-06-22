import { z } from '@hono/zod-openapi';

export const patchMeBodySchema = z.object({
  fullName: z.string().optional(),
  role: z.string().optional(),
  location: z.string().optional(),
  website: z.string().nullable().optional(),
  userType: z.enum(['DEVELOPER', 'COMPANY']).optional(),
  activeCompanyId: z.string().optional(),
  allowContact: z.boolean().optional(),
});
