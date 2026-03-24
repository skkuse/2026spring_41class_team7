
import { z } from '@hono/zod-openapi';

export const documentItemSchema = z.object({
  id: z.string().openapi({ example: 'ckx123abc' }),
  name: z.string().openapi({ example: 'H_KANG_RESUME_V2' }),
  status: z.enum(['ACTIVE', 'DRAFT', 'ARCHIVED']).openapi({ example: 'ACTIVE' }),
  sizeLabel: z.string().nullable().openapi({ example: '2.4MB' }),
  tags: z.array(z.string()).openapi({ example: ['Systems', 'Rust'] }),
  createdAt: z.string().datetime().openapi({ example: '2023-10-24T00:00:00.000Z' }),
});

export const listDocumentsResponse200Schema = z.object({
  items: z.array(documentItemSchema),
  page: z.number().int().openapi({ example: 1 }),
  pageLimit: z.number().int().openapi({ example: 10 }),
  total: z.number().int().openapi({ example: 32 }),
  totalPages: z.number().int().openapi({ example: 4 }),
});
