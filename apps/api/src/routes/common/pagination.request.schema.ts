
import { z } from '@hono/zod-openapi';

export const paginationQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1).openapi({
    description: '1-based page number',
    example: 1,
  }),
  pageLimit: z.coerce.number().int().min(1).max(100).default(10).openapi({
    description: 'Number of records per page',
    example: 10,
  }),
});
