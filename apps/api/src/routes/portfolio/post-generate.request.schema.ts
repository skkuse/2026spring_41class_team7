import { z } from '@hono/zod-openapi';

export const postPortfolioGenerateBodySchema = z
  .object({
    assessmentIds: z
      .array(z.string())
      .min(1)
      .max(10)
      .openapi({ example: ['abc123', 'def456'] }),
  })
  .openapi('PortfolioGenerateRequest');
