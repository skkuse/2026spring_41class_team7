import type { RouteHandler } from '@hono/zod-openapi';
import type { Env } from '../../types.js';
import { getHealthRoute } from './get-health.route.js';

export const getHealthHandler: RouteHandler<typeof getHealthRoute, Env> = (c) => {
  return c.json({ status: 'ok' as const, uptime: process.uptime() });
};
