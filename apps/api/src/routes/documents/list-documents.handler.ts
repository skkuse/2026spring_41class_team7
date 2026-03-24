
import type { Prisma } from '@prisma/client';
import type { RouteHandler } from '@hono/zod-openapi';

import type { Env } from '../../types.js';
import { prisma } from '../../lib/prisma.js';
import { listDocumentsRoute } from './list-documents.route.js';

export const listDocumentsHandler: RouteHandler<typeof listDocumentsRoute, Env> = async (c) => {
  const userId = c.get('userId');
  const { page, pageLimit, status, search } = c.req.valid('query');

  const profile = await prisma.profile.findUnique({
    where: { userId },
    select: { id: true },
  });

  if (!profile) {
    return c.json({ message: 'Profile not found.' }, 404);
  }

  const where: Prisma.DocumentWhereInput = {
    profileId: profile.id,
    ...(status ? { status } : {}),
    ...(search ? { name: { contains: search, mode: 'insensitive' } } : {}),
  };

  const [total, rows] = await Promise.all([
    prisma.document.count({ where }),
    prisma.document.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * pageLimit,
      take: pageLimit,
      select: {
        id: true,
        name: true,
        status: true,
        sizeLabel: true,
        tags: true,
        createdAt: true,
      },
    }),
  ]);

  return c.json(
    {
      items: rows.map((row) => ({ ...row, createdAt: row.createdAt.toISOString() })),
      page,
      pageLimit,
      total,
      totalPages: Math.ceil(total / pageLimit),
    },
    200,
  );
};
