
import { z } from '@hono/zod-openapi';

export const invoiceItemSchema = z.object({
  externalId: z.string().openapi({ example: 'INV-2023-010' }),
  amountUsd: z.string().openapi({ example: '12.00' }),
  issuedAt: z.string().datetime().openapi({ example: '2023-10-24T00:00:00.000Z' }),
});

export const listInvoicesResponse200Schema = z.object({
  items: z.array(invoiceItemSchema),
  page: z.number().int().openapi({ example: 1 }),
  pageLimit: z.number().int().openapi({ example: 10 }),
  total: z.number().int().openapi({ example: 12 }),
  totalPages: z.number().int().openapi({ example: 2 }),
});
