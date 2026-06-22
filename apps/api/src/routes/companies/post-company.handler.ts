import type { RouteHandler } from '@hono/zod-openapi';

import type { Env } from '../../types.js';
import { prisma } from '../../lib/prisma.js';
import { postCompanyRoute } from './post-company.route.js';

export const postCompanyHandler: RouteHandler<typeof postCompanyRoute, Env> = async (c) => {
  const userId = c.get('userId');
  const body = c.req.valid('json');

  const profile = await prisma.profile.findUnique({
    where: { userId },
    select: { id: true },
  });

  if (!profile) {
    return c.json({ message: 'Profile not found.' }, 404 as never);
  }

  const company = await prisma.company.create({
    data: {
      profileId: profile.id,
      name: body.name,
      industry: body.industry ?? null,
    },
    select: { id: true, name: true, industry: true, createdAt: true },
  });

  // Set as active company and switch to COMPANY mode
  await prisma.profile.update({
    where: { userId },
    data: { userType: 'COMPANY', activeCompanyId: company.id },
  });

  return c.json({ ...company, createdAt: company.createdAt.toISOString() }, 201);
};
