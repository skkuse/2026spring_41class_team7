import { createRoute, z } from '@hono/zod-openapi';
import { todoSchema } from './todo.schema.js';

export const listTodosRoute = createRoute({
  method: 'get',
  path: '/todos',
  tags: ['Todos'],
  summary: 'List all todos',
  responses: {
    200: {
      content: {
        'application/json': {
          schema: z.object({ data: z.array(todoSchema), total: z.number() }),
        },
      },
      description: 'List of todos',
    },
  },
});
