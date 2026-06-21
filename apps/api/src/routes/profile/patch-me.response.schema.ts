import { z } from '@hono/zod-openapi';

export const patchMeResponse200Schema = z.object({
  userType: z.enum(['DEVELOPER', 'COMPANY']).nullable(),
  activeCompanyId: z.string().nullable(),
  allowContact: z.boolean(),
  demoDataSeeded: z.boolean(),
});
