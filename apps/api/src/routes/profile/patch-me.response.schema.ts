import { z } from '@hono/zod-openapi';

export const patchMeResponse200Schema = z.object({
  fullName: z.string(),
  role: z.string(),
  location: z.string(),
  website: z.string().nullable(),
  userType: z.enum(['DEVELOPER', 'COMPANY']).nullable(),
  activeCompanyId: z.string().nullable(),
  allowContact: z.boolean(),
  demoDataSeeded: z.boolean(),
});
