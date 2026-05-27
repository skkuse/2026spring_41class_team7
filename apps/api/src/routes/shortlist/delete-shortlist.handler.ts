import type { RouteHandler } from '@hono/zod-openapi';

import type { Env } from '../../types.js';
import { prisma } from '../../lib/prisma.js';
import { deleteShortlistRoute } from './delete-shortlist.route.js';

export const deleteShortlistHandler: RouteHandler<typeof deleteShortlistRoute, Env> = async (c) => {
  const companyUserId = c.get('userId');
  const { devUserId } = c.req.valid('param');

  await prisma.shortlist
    .delete({ where: { companyUserId_devUserId: { companyUserId, devUserId } } })
    .catch(() => {
      /* already deleted — ignore */
    });

  return c.json({ removed: true }, 200);
};
