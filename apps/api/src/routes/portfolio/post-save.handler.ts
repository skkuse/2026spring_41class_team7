import type { RouteHandler } from '@hono/zod-openapi';

import type { Env } from '../../types.js';
import { prisma } from '../../lib/prisma.js';
import { postPortfolioSaveRoute } from './post-save.route.js';

export const postPortfolioSaveHandler: RouteHandler<typeof postPortfolioSaveRoute, Env> = async (c) => {
  const userId = c.get('userId');
  const { sections, title, documentId } = c.req.valid('json');

  let profile = await prisma.profile.findUnique({
    where: { userId },
    select: { id: true },
  });

  if (!profile) {
    profile = await prisma.profile.create({
      data: { userId, fullName: '', email: '', role: '', location: '', isPro: false },
      select: { id: true },
    });
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

  // Update existing document if documentId is provided, otherwise create new
  let doc: { id: string };
  if (documentId) {
    doc = await prisma.document.update({
      where: { id: documentId, projectId: project.id },
      data: { content: sections, name: title ?? 'Portfolio' },
      select: { id: true },
    });
  } else {
    doc = await prisma.document.create({
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
  }

  return c.json({ documentId: doc.id }, 200);
};
