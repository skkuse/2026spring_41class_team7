import type { RouteHandler } from '@hono/zod-openapi';

import type { Env } from '../../types.js';
import { prisma } from '../../lib/prisma.js';
import { getMeRoute } from './get-me.route.js';

export const getMeHandler: RouteHandler<typeof getMeRoute, Env> = async (c) => {
  const userId = c.get('userId');

  const profile = await prisma.profile.findUnique({
    where: { userId },
    select: {
      userId: true,
      fullName: true,
      email: true,
      role: true,
      location: true,
      website: true,
      isPro: true,
      userType: true,
      activeCompanyId: true,
      allowContact: true,
      avatarUrl: true,
      companies: {
        select: { id: true, name: true, industry: true, createdAt: true },
        orderBy: { createdAt: 'asc' },
      },
    },
  });

  if (!profile) {
    return c.json({ message: 'Profile not found.' }, 404);
  }

  const companies = profile.companies.map((c) => ({
    ...c,
    createdAt: c.createdAt.toISOString(),
  }));

  const activeCompany = companies.find((c) => c.id === profile.activeCompanyId) ?? null;

  return c.json({
    ...profile,
    companies,
    activeCompany,
  }, 200);
};
