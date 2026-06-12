import type { RouteHandler } from '@hono/zod-openapi';
import type { Env } from '../../types.js';
import { cache } from '../../lib/cache.js';
import { addTodo } from './store.js';
import { createTodoRoute } from './create-todo.route.js';

export const createTodoHandler: RouteHandler<typeof createTodoRoute, Env> = (c) => {
  const { title } = c.req.valid('json');
  const todo = addTodo(title);
  cache.delete('todos:list');
  return c.json(todo, 201);
};
