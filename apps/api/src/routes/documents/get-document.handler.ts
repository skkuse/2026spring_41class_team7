import type { RouteHandler } from '@hono/zod-openapi';

import type { Env } from '../../types.js';
import { prisma } from '../../lib/prisma.js';
import { getDocumentRoute } from './get-document.route.js';

export const getDocumentHandler: RouteHandler<typeof getDocumentRoute, Env> = async (c) => {
  const userId = c.get('userId');
  const { id } = c.req.valid('param');

  const profile = await prisma.profile.findUnique({
    where: { userId },
    select: { id: true },
  });
  if (!profile) return c.json({ message: 'Profile not found.' }, 404);

  const doc = await prisma.document.findFirst({
    where: { id, project: { profileId: profile.id } },
    select: { id: true, name: true, status: true, content: true, createdAt: true },
  });
  if (!doc) return c.json({ message: 'Document not found.' }, 404);

  return c.json(
    {
      id: doc.id,
      name: doc.name,
      status: doc.status as 'ACTIVE' | 'DRAFT' | 'ARCHIVED',
      sections: (doc.content as object[]) ?? [],
      createdAt: doc.createdAt.toISOString(),
    },
    200,
  );
};
