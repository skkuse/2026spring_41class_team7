import { z } from '@hono/zod-openapi';

export const postPortfolioSaveResponseSchema = z
  .object({
    documentId: z.string(),
  })
  .openapi('PortfolioSaveResponse');
