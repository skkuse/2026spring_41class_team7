import { createRoute, z } from '@hono/zod-openapi';
import { createTodoBodySchema, todoSchema } from './todo.schema.js';

export const createTodoRoute = createRoute({
  method: 'post',
  path: '/todos',
  tags: ['Todos'],
  summary: 'Create a todo',
  request: {
    body: { content: { 'application/json': { schema: createTodoBodySchema } }, required: true },
  },
  responses: {
    201: {
      content: { 'application/json': { schema: todoSchema } },
      description: 'Created todo',
    },
    400: {
      content: {
        'application/json': {
          schema: z.object({ message: z.string(), errors: z.array(z.unknown()).optional() }),
        },
      },
      description: 'Validation error',
    },
  },
});
