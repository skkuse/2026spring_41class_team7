import type { RouteHandler } from '@hono/zod-openapi';
import type { Env } from '../../types.js';
import { cache } from '../../lib/cache.js';
import { todos } from './store.js';
import { listTodosRoute } from './list-todos.route.js';

const CACHE_KEY = 'todos:list';

export const listTodosHandler: RouteHandler<typeof listTodosRoute, Env> = (c) => {
  const cached = cache.get<typeof todos>(CACHE_KEY);
  const data = cached ?? todos;
  if (!cached) cache.set(CACHE_KEY, [...data], 5_000);
  return c.json({ data, total: data.length });
};
