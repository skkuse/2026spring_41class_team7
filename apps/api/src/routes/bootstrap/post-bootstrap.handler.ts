import type { RouteHandler } from '@hono/zod-openapi';

import type { Env } from '../../types.js';
import { prisma } from '../../lib/prisma.js';
import { postBootstrapRoute } from './post-bootstrap.route.js';

export const postBootstrapHandler: RouteHandler<typeof postBootstrapRoute, Env> = async (c) => {
  const userId = c.get('userId');

  const existingProfile = await prisma.profile.findUnique({
    where: { userId },
    select: { id: true },
  });

  const profileCreated = !existingProfile;

  if (profileCreated) {
    await prisma.profile.create({
      data: {
        userId,
        fullName: '',
        email: '',
        role: '',
        location: '',
        isPro: false,
      },
    });
  }

  return c.json({ profileCreated, documentsCreated: 0, invoicesCreated: 0 }, 200);
};
