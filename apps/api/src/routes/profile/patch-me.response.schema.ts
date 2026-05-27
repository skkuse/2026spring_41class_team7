import { z } from '@hono/zod-openapi';

export const patchMeResponse200Schema = z.object({
  userType: z.enum(['DEVELOPER', 'COMPANY']).nullable(),
  companyName: z.string().nullable(),
  industry: z.string().nullable(),
  allowContact: z.boolean(),
  demoDataSeeded: z.boolean(),
});
