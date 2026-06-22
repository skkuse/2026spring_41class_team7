import type { RouteHandler } from '@hono/zod-openapi';

import type { Env } from '../../types.js';
import { prisma } from '../../lib/prisma.js';
import { patchDocumentRoute } from './patch-document.route.js';

export const patchDocumentHandler: RouteHandler<typeof patchDocumentRoute, Env> = async (c) => {
  const userId = c.get('userId');
  const { id } = c.req.valid('param');
  const { name } = c.req.valid('json');

  const profile = await prisma.profile.findUnique({
    where: { userId },
    select: { id: true },
  });
  if (!profile) return c.json({ message: 'Profile not found.' }, 404);

  const doc = await prisma.document.findFirst({
    where: { id, project: { profileId: profile.id } },
    select: { id: true },
  });
  if (!doc) return c.json({ message: 'Document not found.' }, 404);

  const updated = await prisma.document.update({
    where: { id },
    data: { name },
    select: { id: true, name: true },
  });

  return c.json(updated, 200);
};
