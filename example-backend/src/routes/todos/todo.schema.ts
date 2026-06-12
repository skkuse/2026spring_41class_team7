import { z } from '@hono/zod-openapi';

export const todoSchema = z.object({
  id: z.string().openapi({ example: '1' }),
  title: z.string().min(1).openapi({ example: 'Buy groceries' }),
  done: z.boolean().openapi({ example: false }),
  createdAt: z.string().datetime().openapi({ example: '2026-01-01T00:00:00.000Z' }),
});

export const createTodoBodySchema = z.object({
  title: z.string().min(1).max(200).openapi({ example: 'Buy groceries' }),
});

export const updateTodoBodySchema = z.object({
  done: z.boolean().openapi({ example: true }),
});

export type Todo = z.infer<typeof todoSchema>;
