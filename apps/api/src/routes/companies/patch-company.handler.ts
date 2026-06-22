import type { RouteHandler } from '@hono/zod-openapi';

import type { Env } from '../../types.js';
import { prisma } from '../../lib/prisma.js';
import { patchCompanyRoute } from './patch-company.route.js';

export const patchCompanyHandler: RouteHandler<typeof patchCompanyRoute, Env> = async (c) => {
  const userId = c.get('userId');
  const { id } = c.req.valid('param');
  const body = c.req.valid('json');

  const profile = await prisma.profile.findUnique({
    where: { userId },
    select: { id: true },
  });

  if (!profile) {
    return c.json({ message: 'Profile not found.' }, 404);
  }

  const existing = await prisma.company.findFirst({
    where: { id, profileId: profile.id },
  });

  if (!existing) {
    return c.json({ message: 'Company not found.' }, 404);
  }

  const company = await prisma.company.update({
    where: { id },
    data: {
      ...(body.name !== undefined && { name: body.name }),
      ...(body.industry !== undefined && { industry: body.industry }),
    },
    select: { id: true, name: true, industry: true, createdAt: true },
  });

  return c.json({ ...company, createdAt: company.createdAt.toISOString() }, 200);
};
