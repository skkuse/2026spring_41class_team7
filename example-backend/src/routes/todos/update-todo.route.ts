import { createRoute, z } from '@hono/zod-openapi';
import { todoSchema, updateTodoBodySchema } from './todo.schema.js';

export const updateTodoRoute = createRoute({
  method: 'patch',
  path: '/todos/{id}',
  tags: ['Todos'],
  summary: 'Update a todo',
  request: {
    params: z.object({ id: z.string().openapi({ example: '1' }) }),
    body: { content: { 'application/json': { schema: updateTodoBodySchema } }, required: true },
  },
  responses: {
    200: {
      content: { 'application/json': { schema: todoSchema } },
      description: 'Updated todo',
    },
    404: {
      content: {
        'application/json': { schema: z.object({ message: z.string() }) },
      },
      description: 'Not found',
    },
  },
});
