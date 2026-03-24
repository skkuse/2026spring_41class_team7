
import { z } from '@hono/zod-openapi';

import { paginationQuerySchema } from '../common/pagination.request.schema.js';

export const listDocumentsQuerySchema = paginationQuerySchema.extend({
  status: z.enum(['ACTIVE', 'DRAFT', 'ARCHIVED']).optional().openapi({
    description: 'Filter by document status',
    example: 'ACTIVE',
  }),
  search: z.string().min(1).max(100).optional().openapi({
    description: 'Case-insensitive search by document name',
    example: 'resume',
  }),
});
