import type { RouteHandler } from '@hono/zod-openapi';

import type { Env } from '../../types.js';
import { prisma } from '../../lib/prisma.js';
import { listCompaniesRoute } from './list-companies.route.js';

export const listCompaniesHandler: RouteHandler<typeof listCompaniesRoute, Env> = async (c) => {
  const userId = c.get('userId');

  const profile = await prisma.profile.findUnique({
    where: { userId },
    select: { id: true },
  });

  if (!profile) {
    return c.json({ companies: [] }, 200);
  }

  const companies = await prisma.company.findMany({
    where: { profileId: profile.id },
    select: { id: true, name: true, industry: true, createdAt: true },
    orderBy: { createdAt: 'asc' },
  });

  return c.json({
    companies: companies.map((c) => ({ ...c, createdAt: c.createdAt.toISOString() })),
  }, 200);
};
