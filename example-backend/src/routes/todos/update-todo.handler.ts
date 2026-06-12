import type { RouteHandler } from '@hono/zod-openapi';
import type { Env } from '../../types.js';
import { cache } from '../../lib/cache.js';
import { patchTodo } from './store.js';
import { updateTodoRoute } from './update-todo.route.js';

export const updateTodoHandler: RouteHandler<typeof updateTodoRoute, Env> = (c) => {
  const { id } = c.req.valid('param');
  const { done } = c.req.valid('json');
  const todo = patchTodo(id, done);
  if (!todo) return c.json({ message: 'Todo not found' }, 404);
  cache.delete('todos:list');
  return c.json(todo, 200);
};
