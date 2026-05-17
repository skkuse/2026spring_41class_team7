import { z } from '@hono/zod-openapi';

export const postAssessmentResponse201Schema = z.object({
  id: z.string().openapi({ example: 'clx123abc' }),
  url: z.string().openapi({ example: 'https://jobclaw.fyi/user/repo' }),
});
