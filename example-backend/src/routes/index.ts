import type { OpenAPIHono } from '@hono/zod-openapi';
import type { Env } from '../types.js';
import { getHealthHandler } from './health/get-health.handler.js';
import { getHealthRoute } from './health/get-health.route.js';
import { listTodosHandler } from './todos/list-todos.handler.js';
import { listTodosRoute } from './todos/list-todos.route.js';
import { createTodoHandler } from './todos/create-todo.handler.js';
import { createTodoRoute } from './todos/create-todo.route.js';
import { updateTodoHandler } from './todos/update-todo.handler.js';
import { updateTodoRoute } from './todos/update-todo.route.js';

export function registerRoutes(app: OpenAPIHono<Env>): void {
  app.openapi(getHealthRoute, getHealthHandler);
  app.openapi(listTodosRoute, listTodosHandler);
  app.openapi(createTodoRoute, createTodoHandler);
  app.openapi(updateTodoRoute, updateTodoHandler);
}
