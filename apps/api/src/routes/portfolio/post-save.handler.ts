import type { RouteHandler } from '@hono/zod-openapi';

import type { Env } from '../../types.js';
import { prisma } from '../../lib/prisma.js';
import { postPortfolioSaveRoute } from './post-save.route.js';

export const postPortfolioSaveHandler: RouteHandler<typeof postPortfolioSaveRoute, Env> = async (c) => {
  const userId = c.get('userId');
  const { sections, title } = c.req.valid('json');

  const profile = await prisma.profile.findUnique({
    where: { userId },
    select: { id: true },
  });

  if (!profile) {
    return c.json({ message: 'Profile not found.' }, 404);
  }

  // Find or create the "Portfolio" project for this profile
  let project = await prisma.project.findFirst({
    where: { profileId: profile.id, name: 'Portfolio' },
    select: { id: true },
  });

  if (!project) {
    project = await prisma.project.create({
      data: { profileId: profile.id, name: 'Portfolio' },
      select: { id: true },
    });
  }

  const doc = await prisma.document.create({
    data: {
      projectId: project.id,
      name: title ?? 'Portfolio',
      status: 'ACTIVE',
      tags: ['portfolio'],
      sizeLabel: null,
      content: sections,
    },
    select: { id: true },
  });

  return c.json({ documentId: doc.id }, 200);
};
