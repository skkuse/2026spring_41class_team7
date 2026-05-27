import type { RouteHandler } from '@hono/zod-openapi';

import type { Env } from '../../types.js';
import { prisma } from '../../lib/prisma.js';
import { postShortlistRoute } from './post-shortlist.route.js';

export const postShortlistHandler: RouteHandler<typeof postShortlistRoute, Env> = async (c) => {
  const companyUserId = c.get('userId');
  const { devUserId } = c.req.valid('json');

  await prisma.shortlist.upsert({
    where: { companyUserId_devUserId: { companyUserId, devUserId } },
    create: { companyUserId, devUserId },
    update: {},
  });

  return c.json({ devUserId }, 200);
};
