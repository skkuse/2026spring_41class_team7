import type { RouteHandler } from '@hono/zod-openapi';
import type { ExampleResponse } from '@team7/contracts';

import type { Env } from '../../types.js';
import { getExampleRoute } from './get-example.route.js';

export const getExampleHandler: RouteHandler<typeof getExampleRoute, Env> = (c) => {
  const { name } = c.req.valid('query');
  const message = name ? `Hello, ${name}!` : 'Hello from Hono + OpenAPI + Scalar!';

  const response: ExampleResponse = { message };
  return c.json(response, 200);
};
