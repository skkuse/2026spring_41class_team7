import { z } from '@hono/zod-openapi';

export const patchMeBodySchema = z.object({
  userType: z.enum(['DEVELOPER', 'COMPANY']).optional(),
  activeCompanyId: z.string().optional(),
  allowContact: z.boolean().optional(),
});
