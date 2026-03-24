import type { RouteHandler } from '@hono/zod-openapi';

import type { Env } from '../../types.js';
import { getHealthRoute } from './get-health.route.js';

export const getHealthHandler: RouteHandler<typeof getHealthRoute, Env> = (c) => {
  const { fail } = c.req.valid('query');

  if (fail === 'true') {
    return c.json(
      {
        status: 'error',
        message: 'Database is unavailable',
      },
      503,
    );
  }

  return c.json(
    {
      status: 'ok',
      service: 'api',
    },
    200,
  );
};
