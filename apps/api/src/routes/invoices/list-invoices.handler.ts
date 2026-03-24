
import type { RouteHandler } from '@hono/zod-openapi';

import type { Env } from '../../types.js';
import { prisma } from '../../lib/prisma.js';
import { listInvoicesRoute } from './list-invoices.route.js';

export const listInvoicesHandler: RouteHandler<typeof listInvoicesRoute, Env> = async (c) => {
  const userId = c.get('userId');
  const { page, pageLimit } = c.req.valid('query');

  const profile = await prisma.profile.findUnique({
    where: { userId },
    select: { id: true },
  });

  if (!profile) {
    return c.json({ message: 'Profile not found.' }, 404);
  }

  const where = { profileId: profile.id };

  const [total, rows] = await Promise.all([
    prisma.invoice.count({ where }),
    prisma.invoice.findMany({
      where,
      orderBy: { issuedAt: 'desc' },
      skip: (page - 1) * pageLimit,
      take: pageLimit,
      select: {
        externalId: true,
        amountUsd: true,
        issuedAt: true,
      },
    }),
  ]);

  return c.json(
    {
      items: rows.map((row) => ({
        externalId: row.externalId,
        amountUsd: row.amountUsd.toString(),
        issuedAt: row.issuedAt.toISOString(),
      })),
      page,
      pageLimit,
      total,
      totalPages: Math.ceil(total / pageLimit),
    },
    200,
  );
};
