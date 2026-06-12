import type { RouteHandler } from '@hono/zod-openapi';

import type { Env } from '../../types.js';
import { prisma } from '../../lib/prisma.js';
import { getPublicDocumentRoute } from './get-public-document.route.js';

export const getPublicDocumentHandler: RouteHandler<typeof getPublicDocumentRoute, Env> = async (c) => {
  const { id } = c.req.valid('param');

  const doc = await prisma.document.findFirst({
    where: { id, status: 'ACTIVE' },
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
