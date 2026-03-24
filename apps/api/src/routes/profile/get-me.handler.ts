
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
    },
  });

  if (!profile) {
    return c.json({ message: 'Profile not found.' }, 404);
  }

  return c.json(profile, 200);
};
